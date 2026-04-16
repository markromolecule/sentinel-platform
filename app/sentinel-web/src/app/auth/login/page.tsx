'use client';

import { Card, CardContent, CardFooter } from '@sentinel/ui';
import { LoginHeader } from '@/app/auth/login/_components/login-header';
import { LoginForm } from '@/app/auth/login/_components/login-form';
import { SocialLogin } from '@/components/auth/social-login';
import { LoginFooter } from '@/app/auth/login/_components/login-footer';
import { useLoginForm } from '@/app/auth/login/_hooks/use-login-form';

export default function LoginPage() {
    const { form, authError, isLoading, onSubmit } = useLoginForm();

    return (
        <Card className="w-full gap-0 border-white/10 bg-[#131315] text-white shadow-2xl">
            <LoginHeader />
            <CardContent className="space-y-4 p-4 sm:p-6 sm:pb-4">
                <LoginForm
                    form={form}
                    authError={authError}
                    isLoading={isLoading}
                    onSubmit={onSubmit}
                />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-0">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#131315] px-2 font-medium tracking-wider text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>
                <SocialLogin />
                <LoginFooter />
                <p className="text-center text-xs leading-relaxed text-gray-500">
                    Need help accessing your account? Contact{' '}
                    <a
                        href="mailto:support@sentinelph.tech"
                        className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                    >
                        support@sentinelph.tech
                    </a>
                </p>
            </CardFooter>
        </Card>
    );
}
