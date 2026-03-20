import { createSupabaseServerClient } from '@/data/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const coreUrl = process.env.NEXT_PUBLIC_CORE_URL || 'http://localhost:3002';

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${coreUrl}/dashboard`);
        }
    }

    // Return the user to an error page
    return NextResponse.redirect(`${coreUrl}/auth/auth-code-error`);
}
