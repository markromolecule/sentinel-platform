import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * PROXY MIDDLEWARE
 * Handles:
 * 1. Subdomain routing (Production)
 * 2. Session refreshing (SSR)
 * 3. Role-Based Access Control (RBAC)
 */
export default async function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const CORE_URL = process.env.NEXT_PUBLIC_CORE_URL || 'https://core.sentinelph.tech';
    const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://app.sentinelph.tech';

    const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

    // Initialize response
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Initialize Supabase Client with Cookie Sync
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('CRITICAL: Supabase environment variables are missing in middleware!');
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'sentinel-support-auth',
                persistSession: true,
            },
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Update request cookies for the current execution
                    request.cookies.set({ name, value, ...options });
                    // Update response cookies for the browser
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        },
    );

    // Get current user and refresh session (Server-side validation)
    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error('SUPABASE AUTH ERROR IN PROXY:', e);
    }

    const url = request.nextUrl.clone();
    const isLoginPage = url.pathname === '/auth/login';
    const isAuthPath = url.pathname.startsWith('/auth');

    // Define protected pages (anything that isn't login, static, or api)
    const isProtectedPage =
        url.pathname !== '/' &&
        !isAuthPath &&
        !url.pathname.startsWith('/api') &&
        !url.pathname.startsWith('/_next') &&
        !url.pathname.includes('.');

    /**
     * HELPER: Sync Cookies to Redirect
     * This prevents the 307 loop by ensuring the redirect carries the session cookies.
     */
    const redirectWithSession = (dest: string | URL) => {
        const redirectUrl = typeof dest === 'string' ? new URL(dest, request.url) : dest;
        const redirectResponse = NextResponse.redirect(redirectUrl);

        // Copy cookies from our refreshed session response to the redirect response
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });

        return redirectResponse;
    };

    // 1. Role-Based Access Control (RBAC)
    if (user) {
        const role = user.user_metadata?.role;

        if (role !== 'support') {
            if (!isProduction) {
                return redirectWithSession('/auth/login');
            }

            const destination =
                role === 'admin' || role === 'superadmin' || role === 'disciplinary_officer'
                    ? CORE_URL
                    : WEB_URL;

            return NextResponse.redirect(new URL('/', destination));
        }

        if (isLoginPage) {
            return redirectWithSession('/dashboard');
        }

        if (url.pathname === '/') {
            return redirectWithSession('/dashboard');
        }
    } else {
        if (isProtectedPage || url.pathname === '/') {
            return redirectWithSession('/auth/login');
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all paths except static assets and icons
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
