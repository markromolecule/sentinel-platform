'use client';

import { Card, CardContent, CardFooter } from "@sentinel/ui";
import { LoginHeader } from "@/app/auth/login/_components/login-header";
import { LoginForm } from "@/app/auth/login/_components/login-form";
import { SocialLogin } from "@/app/auth/login/_components/social-login";
import { LoginFooter } from "@/app/auth/login/_components/login-footer";
import { useLoginForm } from "@/app/auth/login/_hooks/use-login-form";

export default function LoginPage() {
    const {
        form,
        authError,
        isLoading,
        onSubmit
    } = useLoginForm();

    return (
        <div className="w-full animate-fade-in transition-all duration-700">
            <Card className="bg-[#131315]/40 backdrop-blur-2xl border-white/[0.08] text-white w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] gap-0 overflow-hidden relative group">
                {/* Subtle top highlights */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                <LoginHeader />
                <CardContent className="space-y-4 p-4 sm:p-6 sm:pb-4 relative z-10">
                    <LoginForm
                        form={form}
                        authError={authError}
                        isLoading={isLoading}
                        onSubmit={onSubmit}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-0 relative z-10">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#131315] px-2 text-gray-500 font-medium tracking-wider">Or continue with</span>
                        </div>
                    </div>
                    <SocialLogin />
                    <LoginFooter />
                </CardFooter>

                {/* Bottom glass reflection effect */}
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
            </Card>
        </div>
    );
}
