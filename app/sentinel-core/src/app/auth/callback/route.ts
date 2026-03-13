import { createSupabaseServerClient } from '@/data/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/admin/dashboard';

    const coreUrl = process.env.NEXT_PUBLIC_CORE_URL || 'http://localhost:3002';

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const role = user?.user_metadata?.role;

            if (role === 'superadmin') {
                const redirectNext = next === '/admin/dashboard' ? '/superadmin/dashboard' : next;
                return NextResponse.redirect(`${coreUrl}${redirectNext}`);
            }

            if (role === 'admin') {
                return NextResponse.redirect(`${coreUrl}${next}`);
            }
        }
    }

    // Return the user to an error page
    return NextResponse.redirect(`${coreUrl}/auth/auth-code-error`);
}
