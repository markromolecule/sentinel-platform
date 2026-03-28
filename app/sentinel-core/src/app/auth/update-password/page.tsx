'use client';

import { Card, CardContent } from "@sentinel/ui";
import { UpdatePasswordHeader } from "@/app/auth/update-password/_components/update-password-header";
import { UpdatePasswordForm } from "@/app/auth/update-password/_components/update-password-form";
import { useUpdatePasswordForm } from "@/app/auth/update-password/_hooks/use-update-password-form";

export default function UpdatePasswordPage() {
    const {
        form,
        authError,
        isLoading,
        onSubmit
    } = useUpdatePasswordForm();

    return (
        <div className="w-full animate-fade-in transition-all duration-700">
            <Card className="bg-[#131315]/40 backdrop-blur-2xl border-white/[0.08] text-white w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] gap-0 overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                <UpdatePasswordHeader />
                <CardContent className="space-y-4 p-4 sm:p-6 sm:pb-8 relative z-10">
                    <UpdatePasswordForm
                        form={form}
                        authError={authError}
                        isLoading={isLoading}
                        onSubmit={onSubmit}
                    />
                </CardContent>

                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
            </Card>
        </div>
    );
}
