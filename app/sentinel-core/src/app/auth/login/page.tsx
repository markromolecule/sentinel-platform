'use client';

import { Card, CardContent, CardFooter } from "@sentinel/ui";
import { LoginHeader } from "@/app/auth/login/_components/login-header";
import { LoginForm } from "@/app/auth/login/_components/login-form";
import { SocialLogin } from "@/app/auth/login/_components/social-login";
import { useLoginForm } from "@/app/auth/login/_hooks/use-login-form";

export default function LoginPage() {
    const {
        form,
        authError,
        isLoading,
        onSubmit
    } = useLoginForm();

    return (
        <Card className="bg-[#131315] border-white/10 text-white w-full shadow-2xl gap-0">
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
                <SocialLogin />
            </CardFooter>
        </Card>
    );
}
