import { createSupabaseServerClient } from '@/data/supabase/server';
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check User Role and Redirection Logic
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const role = user?.user_metadata?.role || 'student';

            if (role === 'student') {
                // Check if student record exists
                const { data: studentData } = await supabase
                    .from('students')
                    .select('student_id')
                    .eq('user_id', user?.id)
                    .single();

                if (studentData) {
                    return NextResponse.redirect(`${config.appUrl}/student`);
                } else {
                    return NextResponse.redirect(`${config.appUrl}/onboarding`);
                }
            } else if (role === 'proctor') {
                return NextResponse.redirect(`${config.appUrl}/proctor`);
            }

            // Default Fallback
            return NextResponse.redirect(`${config.appUrl}/auth/login?error=Unauthorized role access`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${config.appUrl}/auth/auth-code-error`);
}
