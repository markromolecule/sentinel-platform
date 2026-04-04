import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { EMAIL_OTP_TYPES } from '@/app/auth/callback/constants';
import { resolveWebAuthState } from '@/lib/auth/resolve-web-auth-state';

type PendingCookie = {
    name: string;
    value: string;
    options: CookieOptions;
};
    
function getSafeNext(next: string | null) {
    return next && next.startsWith('/') ? next : null;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = getSafeNext(searchParams.get('next'));
    const cookieStore = await cookies();
    const pendingCookies: PendingCookie[] = [];

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'sentinel-web-auth',
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

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth Callback Error:', error.message);
            const response = NextResponse.redirect(
                `${origin}/auth/login?error=Could not verify your access.`,
            );
            applyPendingCookies(response);
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
            applyPendingCookies(response);
            return response;
        }
    }

    // Default: Redirect to "next" or specific roles' default pages.
    if (next) {
        const response = NextResponse.redirect(`${origin}${next}`);
        applyPendingCookies(response);
        return response;
    }

    // Role-based logic for cases where 'next' is not provided.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const response = NextResponse.redirect(`${origin}/auth/login`);
        applyPendingCookies(response);
        return response;
    }

    const authState = await resolveWebAuthState(supabase, user);
    const response = NextResponse.redirect(`${origin}${authState.destination}`);
    applyPendingCookies(response);
    return response;
}
