import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { EMAIL_OTP_TYPES } from '@/app/auth/callback/constant';
import { resolveCoreRole } from '../../../lib/auth/core-role';

type PendingCookie = {
    name: string;
    value: string;
    options: CookieOptions;
};

function getSafeNext(next: string | null, fallback: string) {
    return next && next.startsWith('/') ? next : fallback;
}

function resolveWebPortalUrl(requestUrl: URL) {
    const hostname = requestUrl.hostname.toLowerCase();
    const isLocalHost =
        hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    return (
        process.env.NEXT_PUBLIC_WEB_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (isLocalHost ? 'http://localhost:3000' : 'https://app.sentinelph.tech')
    );
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const { searchParams, origin } = requestUrl;
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = getSafeNext(searchParams.get('next'), '/dashboard');

    // Invite and password-reset flows for instructors/students belong to the web portal.
    // If an old or misrouted link lands on core first, forward the untouched auth params
    // so the destination portal can exchange the code / verify the OTP using its own session key.
    if (next.startsWith('/auth/update-password')) {
        const webPortalUrl = resolveWebPortalUrl(requestUrl);
        const redirectUrl = new URL(`/auth/callback${requestUrl.search}`, webPortalUrl);
        return NextResponse.redirect(redirectUrl);
    }

    const cookieStore = await cookies();
    const pendingCookies: PendingCookie[] = [];

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'sentinel-admin-auth',
                persistSession: true,
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll().map(({ name, value }) => ({
                        name,
                        value,
                    }));
                },
                setAll(cookiesToSet: PendingCookie[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        pendingCookies.push({ name, value, options });
                    });
                },
            },
        },
    );

    const applyPendingCookies = (response: NextResponse) => {
        pendingCookies.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
        });
    };

    const redirectToLogin = (message: string) => {
        const loginUrl = new URL('/auth/login', origin);
        loginUrl.searchParams.set('error', message);

        const response = NextResponse.redirect(loginUrl);
        applyPendingCookies(response);
        return response;
    };

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth Callback Error:', error.message);
            return redirectToLogin('Could not verify your access.');
        }
    } else if (tokenHash || type) {
        if (!tokenHash || !type || !EMAIL_OTP_TYPES.has(type as EmailOtpType)) {
            return NextResponse.redirect(`${origin}/auth/login?error=Invalid or expired access.`);
        }

        const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
        });

        if (error) {
            console.error('Auth Callback OTP Error:', error.message);
            return redirectToLogin('Could not verify your access.');
        }
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirectToLogin('Could not verify your access.');
    }

    const role = resolveCoreRole(user);

    if (!role) {
        await supabase.auth.signOut();
        return redirectToLogin('Unauthorized. This portal is for administrators only.');
    }

    // Call sentinel-api to log successful OAuth login
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiBaseUrl}/auth/log-oauth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    provider: session.user?.app_metadata?.provider || 'google_oauth',
                }),
            });
        }
    } catch (logErr) {
        console.error('Failed to log OAuth session to backend:', logErr);
    }

    const response = NextResponse.redirect(`${origin}${next}`);
    applyPendingCookies(response);
    return response;
}
