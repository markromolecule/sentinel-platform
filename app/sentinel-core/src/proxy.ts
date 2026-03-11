import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const PRODUCTION_DOMAIN = 'sentinelph.tech';
    const APP_SUBDOMAIN = `core.${PRODUCTION_DOMAIN}`;
    const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        },
    );

    // Use getUser() as it validates the session with the server
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const isLoginPage = url.pathname === '/auth/login';
    const isProtectedPage =
        url.pathname.startsWith('/admin') || url.pathname.startsWith('/superadmin');

    // 1. Subdomain Proxy/Redirect Logic
    if (isProduction) {
        const isRootDomain =
            hostname === PRODUCTION_DOMAIN || hostname === `www.${PRODUCTION_DOMAIN}`;

        if (
            isRootDomain &&
            (url.pathname === '/' ||
                isLoginPage ||
                url.pathname.startsWith('/admin') ||
                url.pathname.startsWith('/superadmin'))
        ) {
            const redirectUrl = `https://${APP_SUBDOMAIN}${url.pathname}${url.search}`;
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Role-based access control
    if (user) {
        const role = user.user_metadata?.role;

        // Strictly allow ONLY admin and superadmin on this portal
        if (role !== 'admin' && role !== 'superadmin' && !isLoginPage) {
            const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');
            if (isDev) {
                // In development, shared cookies between ports can cause students to be redirected
                // away from the admin portal. We redirect them to /auth/login instead of the other portal.
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }
            const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://app.sentinelph.tech';
            return NextResponse.redirect(new URL('/', webUrl));
        }

        // Redirect admins to dashboard if they hit the login page
        if (isLoginPage && (role === 'admin' || role === 'superadmin')) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    } else {
        // No session and accessing protected page or root
        if (isProtectedPage || url.pathname === '/') {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/admin/:path*', '/superadmin/:path*'],
};
