'use client';

import { OnboardingForm } from "@/app/(protected)/onboarding/_components/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sentinel/ui";

export default function OnboardingPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:px-6 md:py-10">
                <Card className="w-full max-w-5xl bg-[#131315]/95 text-white shadow-2xl backdrop-blur-sm border-white/10">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Complete your profile
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Please provide your student details to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OnboardingForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
