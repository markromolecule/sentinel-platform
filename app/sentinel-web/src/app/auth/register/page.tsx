'use client';

import { Card, CardContent, CardFooter } from '@sentinel/ui';
import { RegisterHeader } from '@/app/auth/register/_components/register-header';
import { RegisterForm } from '@/app/auth/register/_components/register-form';
import { SocialLogin } from '@/components/auth/social-login';
import { RegisterFooter } from '@/app/auth/register/_components/register-footer';
import { useRegisterForm } from '@/app/auth/register/_hooks/use-register-form';

export default function RegisterPage() {
    const { form, authError, successMessage, isLoading, onSubmit } = useRegisterForm();

    return (
        <Card className="w-full gap-0 border-white/10 bg-[#131315] text-white shadow-2xl">
            <RegisterHeader />
            <CardContent className="space-y-4 p-4 sm:p-6 sm:pb-4">
                <RegisterForm
                    form={form}
                    authError={authError}
                    successMessage={successMessage}
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
                <RegisterFooter />
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
