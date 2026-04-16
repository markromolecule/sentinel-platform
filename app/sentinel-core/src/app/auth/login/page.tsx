'use client';

import { Card, CardContent } from '@sentinel/ui';
import { LoginHeader } from '@/app/auth/login/_components/login-header';
import { LoginForm } from '@/app/auth/login/_components/login-form';
import { useLoginForm } from '@/app/auth/login/_hooks/use-login-form';

export default function LoginPage() {
    const { form, authError, isLoading, onSubmit } = useLoginForm();

    return (
        <div className="animate-fade-in w-full font-sans transition-all duration-700">
            <Card className="group relative w-full gap-0 overflow-hidden border-white/[0.08] bg-[#131315]/40 font-sans text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                {/* Subtle top highlights */}
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                <LoginHeader />
                <CardContent className="relative z-10 space-y-4 p-4 sm:p-6 sm:pb-4">
                    <LoginForm
                        form={form}
                        authError={authError}
                        isLoading={isLoading}
                        onSubmit={onSubmit}
                    />
                </CardContent>
                {/* Bottom glass reflection effect */}
                <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl transition-all duration-1000 group-hover:bg-blue-600/20"></div>
            </Card>
        </div>
    );
}
