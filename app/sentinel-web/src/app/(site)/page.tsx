import { redirect } from 'next/navigation';
import {
    HeroSection,
    FeatureSection,
    HowItWorksSection,
    CompareSection,
    DownloadSection,
    FAQSection,
} from '@/app/(public)/landing';
import { AuthSessionRedirect } from '@/app/(site)/_components/auth-session-redirect';
import { createSupabaseServerClient } from '@/data/supabase/server';
import { resolveWebAuthState } from '@/lib/auth/resolve-web-auth-state';

export default async function Home() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        const authState = await resolveWebAuthState(supabase, user);
        redirect(authState.destination);
    }

    return (
        <>
            <AuthSessionRedirect />
            <HeroSection />
            <FeatureSection />
            <HowItWorksSection />
            <CompareSection />
            <FAQSection />
            <DownloadSection />
        </>
    );
}
