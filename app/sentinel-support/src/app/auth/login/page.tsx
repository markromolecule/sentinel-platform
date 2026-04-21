'use client';

import { Card, CardContent, CardFooter } from '@sentinel/ui';
import { LoginHeader } from '@/app/auth/login/_components/login-header';
import { LoginForm } from '@/app/auth/login/_components/login-form';
import { useLoginForm } from '@/app/auth/login/_hooks/use-login-form';
import { SocialLogin } from '@/components/auth/social-login';

export default function LoginPage() {
    const { form, authError, isLoading, onSubmit } = useLoginForm();

    return (
        <div className="animate-fade-in w-full transition-all duration-700">
            <Card className="group relative w-full gap-0 overflow-hidden border-white/[0.08] bg-[#131315]/40 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
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
                <CardFooter className="relative z-10 flex flex-col gap-4 pt-0">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#131315]/40 px-2 font-medium tracking-wider text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <SocialLogin />
                </CardFooter>
                {/* Bottom glass reflection effect */}
                <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl transition-all duration-1000 group-hover:bg-blue-600/20"></div>
            </Card>
        </div>
    );
}
