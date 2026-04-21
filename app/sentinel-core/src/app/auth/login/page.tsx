import { Suspense } from 'react';
import { Card, CardContent, CardFooter } from '@sentinel/ui';
import { LoginHeader } from '@/app/auth/login/_components/login-header';
import { LoginPageClient } from '@/app/auth/login/_components/login-page-client';

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageFallback />}>
            <LoginPageClient />
        </Suspense>
    );
}

function LoginPageFallback() {
    return (
        <div className="w-full font-sans">
            <Card className="group relative w-full gap-0 overflow-hidden border-white/[0.08] bg-[#131315]/40 font-sans text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                <LoginHeader />
                <CardContent className="relative z-10 space-y-4 p-4 sm:p-6 sm:pb-4">
                    <div className="space-y-4">
                        <div className="rounded-md border border-white/10 bg-white/5 p-3">
                            <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
                            <div className="h-12 w-full animate-pulse rounded-md border border-white/10 bg-[#0f0f10]" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
                            <div className="h-12 w-full animate-pulse rounded-md border border-white/10 bg-[#0f0f10]" />
                            <div className="flex justify-end pt-2">
                                <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
                            </div>
                        </div>
                        <div className="h-12 w-full animate-pulse rounded-md bg-white/10" />
                    </div>
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
                    <div className="h-12 w-full animate-pulse rounded-md bg-white/10" />
                </CardFooter>
                <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl transition-all duration-1000 group-hover:bg-blue-600/20"></div>
            </Card>
        </div>
    );
}
