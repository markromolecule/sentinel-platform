import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

// ============================================================================
// Constants & Configuration
// ============================================================================
const DOMAIN_CONFIG = {
    PRODUCTION: 'sentinelph.tech',
    get APP_SUBDOMAIN() {
        return `app.${this.PRODUCTION}`;
    },
    get IS_DEV() {
        return typeof window !== 'undefined' 
            ? window.location.hostname.includes('localhost') 
            : process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_APP_URL?.includes(this.PRODUCTION);
    },
    get CORE_URL() {
        return process.env.NEXT_PUBLIC_CORE_URL || (this.IS_DEV ? 'http://localhost:3002' : `https://core.${this.PRODUCTION}`);
    },
    get APP_URL() {
        return process.env.NEXT_PUBLIC_APP_URL || (this.IS_DEV ? 'http://localhost:3000' : `https://${this.APP_SUBDOMAIN}`);
    },
};

const ROUTES = {
    APP_PATHS: ['/auth', '/admin', '/proctor', '/student'],
    PROTECTED: ['/student', '/proctor', '/onboarding'],
    AUTH: '/auth',
};

// ============================================================================
// Main Middleware Proxy
// ============================================================================
export async function proxy(request: NextRequest) {
    // 1. Handle Subdomain Redirects
    const subdomainRedirectUrl = getSubdomainRedirectUrl(request);
    if (subdomainRedirectUrl) {
        return NextResponse.redirect(subdomainRedirectUrl);
    }

    // 2. Refresh Session & Get User
    const { user, response } = await getUserAndRefreshSession(request);

    // 3. Handle Role-Based Access Control (RBAC)
    const rbacRedirectUrl = getRbacRedirectUrl(request, user);
    if (rbacRedirectUrl) {
        const redirectResponse = NextResponse.redirect(rbacRedirectUrl);

        // Ensure Supabase session cookies are preserved during redirects
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });

        return redirectResponse;
    }

    // 4. Proceed normally if no redirects are triggered
    return response;
}

// ============================================================================
// Helper 1: Subdomain Routing Logic
// ============================================================================
function getSubdomainRedirectUrl(request: NextRequest): string | null {
    const hostname = request.headers.get('host') || '';
    const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

    if (!isProduction) return null;

    const isRootDomain =
        hostname === DOMAIN_CONFIG.PRODUCTION || hostname === `www.${DOMAIN_CONFIG.PRODUCTION}`;
    const { pathname, search } = request.nextUrl.clone();

    const isAppPath = ROUTES.APP_PATHS.some((path) => pathname.startsWith(path));

    if (isRootDomain && isAppPath) {
        return `https://${DOMAIN_CONFIG.APP_SUBDOMAIN}${pathname}${search}`;
    }

    return null;
}

// ============================================================================
// Helper 2: Supabase Session Management
// ============================================================================
async function getUserAndRefreshSession(request: NextRequest) {
    let response = NextResponse.next({ request: { headers: request.headers } });

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
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();
    return { user, response };
}

// ============================================================================
// Helper 3: Role-Based Access Control (RBAC) Logic
// ============================================================================
function getRbacRedirectUrl(request: NextRequest, user: User | null): URL | null {
    const { pathname } = request.nextUrl.clone();
    const isAuthPage = pathname.startsWith(ROUTES.AUTH);
    const isProtectedPage = ROUTES.PROTECTED.some((route) => pathname.startsWith(route));

    // Case A: Unauthenticated users accessing protected pages
    if (!user && isProtectedPage) {
        return new URL('/auth/login', request.url);
    }

    // Case B: Authenticated users
    if (user) {
        const role = user.user_metadata?.role;

        // B1: Prevent authenticated students/proctors from sitting on login/register pages
        if (isAuthPage) {
            if (role === 'student') return new URL('/student', request.url);
            if (role === 'proctor') return new URL('/proctor/dashboard', request.url);
        }

        // B2: Block admins from accessing student/proctor/onboarding pages
        if (isProtectedPage && (role === 'admin' || role === 'superadmin')) {
            const hostname = request.headers.get('host') || '';
            const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

            if (isProduction) {
                return new URL('/', DOMAIN_CONFIG.CORE_URL);
            }
            return new URL('/', request.url); // Dev fallback
        }
    }

    return null;
}

// ============================================================================
// Next.js Config
// ============================================================================
export const config = {
    matcher: ['/auth/:path*', '/student/:path*', '/proctor/:path*', '/onboarding/:path*'],
};
