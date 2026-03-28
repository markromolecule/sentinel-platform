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
    const PRODUCTION_DOMAIN = 'sentinelph.tech';
    const CORE_SUBDOMAIN = `core.${PRODUCTION_DOMAIN}`;
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
                storageKey: 'sentinel-admin-auth',
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

    // 1. Subdomain Proxy/Redirect Logic (Production Only)
    if (isProduction) {
        const isRootDomain =
            hostname === PRODUCTION_DOMAIN || hostname === `www.${PRODUCTION_DOMAIN}`;

        // If they hit the root or admin paths on the main domain, send them to core subdomain
        if (
            isRootDomain &&
            (url.pathname === '/' || isLoginPage || url.pathname.startsWith('/dashboard'))
        ) {
            return redirectWithSession(`https://${CORE_SUBDOMAIN}${url.pathname}${url.search}`);
        }
    }

    // 2. Role-Based Access Control (RBAC)
    if (user) {
        const role = user.user_metadata?.role;

        // A. BLOCK NON-ADMINS: This portal is ONLY for admin/superadmin
        if (role !== 'admin' && role !== 'superadmin') {
            // If dev, just send to login. If prod, send back to the main WEB app (port 3000)
            if (!isProduction) {
                return redirectWithSession('/auth/login');
            }
            return NextResponse.redirect(new URL('/', WEB_URL));
        }

        // B. REDIRECT AUTH PAGES: If already logged in as Admin, don't show login page
        if (isLoginPage) {
            return redirectWithSession('/dashboard');
        }

        // C. ROOT REDIRECT: If at root '/', send to dashboard
        if (url.pathname === '/') {
            return redirectWithSession('/dashboard');
        }
    } else {
        // 3. UNAUTHENTICATED ACCESS
        // If no user session and trying to access protected content
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
