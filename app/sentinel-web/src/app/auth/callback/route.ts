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
                // Check if student record exists and has completed onboarding
                const { data: studentData } = await supabase
                    .from('students')
                    .select('student_number, department_id')
                    .eq('user_id', user?.id)
                    .single();

                if (studentData && studentData.student_number && studentData.department_id) {
                    return NextResponse.redirect(`${config.appUrl}/student/exam`);
                } else {
                    return NextResponse.redirect(`${config.appUrl}/onboarding`);
                }
            } else if (role === 'instructor') {
                return NextResponse.redirect(`${config.appUrl}/dashboard`);
            }

            // Default Fallback
            return NextResponse.redirect(
                `${config.appUrl}/auth/login?error=Unauthorized role access`,
            );
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${config.appUrl}/auth/auth-code-error`);
}
