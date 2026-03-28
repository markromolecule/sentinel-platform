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
            : process.env.NODE_ENV === 'development' &&
                  !process.env.NEXT_PUBLIC_APP_URL?.includes(this.PRODUCTION);
    },
    get CORE_URL() {
        return (
            process.env.NEXT_PUBLIC_CORE_URL ||
            (this.IS_DEV ? 'http://localhost:3002' : `https://core.${this.PRODUCTION}`)
        );
    },
    get APP_URL() {
        return (
            process.env.NEXT_PUBLIC_APP_URL ||
            (this.IS_DEV ? 'http://localhost:3000' : `https://${this.APP_SUBDOMAIN}`)
        );
    },
};

const ROUTES = {
    APP_PATHS: [
        '/auth',
        '/onboarding',
        '/student',
        '/dashboard',
        '/exams',
        '/subjects',
        '/students',
        '/calendar',
        '/grading',
        '/assignment',
        '/announcements',
        '/messages',
        '/guide',
    ],
    PROTECTED: [
        '/onboarding',
        '/student',
        '/dashboard',
        '/exams',
        '/subjects',
        '/students',
        '/calendar',
        '/grading',
        '/assignment',
        '/announcements',
        '/messages',
        '/guide',
    ],
    AUTH: '/auth',
};

// Routes that belong exclusively to instructors.
// Students should never be able to reach these.
const INSTRUCTOR_ONLY_ROUTES = [
    '/dashboard',
    '/exams',
    '/subjects',
    '/students',
    '/grading',
    '/assignment',
    '/announcements',
    '/messages',
    '/guide',
];

// ============================================================================
// Main Middleware Proxy
// ============================================================================
export default async function proxy(request: NextRequest) {
    // 1. Handle Subdomain Redirects
    const subdomainRedirectUrl = getSubdomainRedirectUrl(request);
    if (subdomainRedirectUrl) {
        return NextResponse.redirect(subdomainRedirectUrl);
    }

    // 2. Refresh Session & Get User
    const { user, response, supabase } = await getUserAndRefreshSession(request);

    // 3. Handle Role-Based Access Control (RBAC)
    const rbacRedirectUrl = await getRbacRedirectUrl(request, user, supabase);
    if (rbacRedirectUrl) {
        const redirectResponse = NextResponse.redirect(new URL(rbacRedirectUrl, request.url));

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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('MISSING SUPABASE ENV IN WEB PROXY:', {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'sentinel-web-auth',
                persistSession: true,
            },
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
    return { user, response, supabase };
}

// ============================================================================
// Helper 3: Role-Based Access Control (RBAC) Logic
// ============================================================================
async function getRbacRedirectUrl(
    request: NextRequest,
    user: User | null,
    supabase: ReturnType<typeof createServerClient>,
): Promise<string | null> {
    const { pathname } = request.nextUrl;
    const isAuthPage = pathname.startsWith(ROUTES.AUTH);
    const isProtectedPage = ROUTES.PROTECTED.some((route) => pathname.startsWith(route));

    // Case A: Unauthenticated users accessing protected pages
    if (!user && isProtectedPage) {
        return '/auth/login';
    }

    // Case B: Authenticated users
    if (user) {
        const role = user.user_metadata?.role;

        // B0: Ensure students are fully onboarded (has student_number and department_id)
        if (role === 'student') {
            const { data: studentData } = await supabase
                .from('students')
                .select('student_number, department_id')
                .eq('user_id', user.id)
                .single();

            const isFullyOnboarded = !!(
                studentData &&
                studentData.student_number &&
                studentData.department_id
            );
            const isOnboardingPage = pathname.startsWith('/onboarding');
            const isStudentPage = pathname.startsWith('/student/');

            // If not fully onboarded and trying to access student pages, redirect to /onboarding
            if (!isFullyOnboarded && isStudentPage && !isOnboardingPage) {
                return '/onboarding';
            }

            // If fully onboarded and trying to access /onboarding, redirect to /exam
            if (isFullyOnboarded && isOnboardingPage) {
                return '/exam';
            }

            // B0.5: Block students from accessing instructor-only pages
            const isInstructorRoute = INSTRUCTOR_ONLY_ROUTES.some((r) => pathname.startsWith(r));
            if (isInstructorRoute) {
                return '/student/exam';
            }
        }

        // B1: Prevent authenticated students/instructors from sitting on login/register pages
        // EXEMPTION: Allow /auth/update-password and /auth/callback to process their tokens without interruption
        const isUpdatePassword = pathname.startsWith('/auth/update-password');
        const isCallback = pathname.startsWith('/auth/callback');

        if (isAuthPage && !isUpdatePassword && !isCallback) {
            if (role === 'student') return '/student/exam';
            if (role === 'instructor') return '/dashboard';
        }

        // B1.5: Block proctor role from accessing protected pages (instructor-only portal)
        if (role === 'proctor' && isProtectedPage) {
            return '/auth/login?error=Unauthorized role access';
        }

        // B2: Block admins from accessing student/onboarding pages
        if (isProtectedPage && (role === 'admin' || role === 'superadmin')) {
            const hostname = request.headers.get('host') || '';
            const isProduction = !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

            if (isProduction) {
                return DOMAIN_CONFIG.CORE_URL;
            }
            return '/'; // Dev fallback
        }
    }

    return null;
}

// ============================================================================
// Next.js Config
// ============================================================================
export const config = {
    matcher: [
        '/auth/:path*',
        '/:path*',
        '/onboarding/:path*',
        '/student/:path*',
        '/dashboard/:path*',
        '/exams/:path*',
        '/subjects/:path*',
        '/students/:path*',
        '/calendar/:path*',
        '/grading/:path*',
        '/assignment/:path*',
        '/announcements/:path*',
        '/messages/:path*',
        '/guide/:path*',
    ],
};
