import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { EMAIL_OTP_TYPES } from '@/app/auth/callback/constant';

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
    const pendingCookies: Array<{
        name: string;
        value: string;
        options: CookieOptions;
    }> = [];

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'sentinel-admin-auth',
                persistSession: true,
            },
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    pendingCookies.push({ name, value, options });
                },
                remove(name: string, options: CookieOptions) {
                    pendingCookies.push({ name, value: '', options });
                },
            },
        },
    );

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth Callback Error:', error.message);
            const response = NextResponse.redirect(
                `${origin}/auth/login?error=Could not verify your access.`,
            );
            pendingCookies.forEach(({ name, value, options }) => {
                response.cookies.set({ name, value, ...options });
            });
            return response;
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
            const response = NextResponse.redirect(
                `${origin}/auth/login?error=Could not verify your access.`,
            );
            pendingCookies.forEach(({ name, value, options }) => {
                response.cookies.set({ name, value, ...options });
            });
            return response;
        }
    }

    // Default: Redirect to "next" or dashboard.
    // This handles both the server-exchanged PKCE flow and the client-side implicit flow (hash).
    const response = NextResponse.redirect(`${origin}${next}`);
    pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set({ name, value, ...options });
    });
    return response;
}
