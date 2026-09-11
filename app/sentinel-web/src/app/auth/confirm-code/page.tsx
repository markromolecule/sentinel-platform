import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Card, CardContent } from '@sentinel/ui';
import { ConfirmCodeForm } from './_components/confirm-code-form';

export const metadata: Metadata = {
    title: 'Confirm Your Email | Sentinel',
    description: 'Verify your email address with the 6-digit confirmation code.',
};

function ConfirmCodeSkeleton() {
    return (
        <Card className="w-full gap-0 border-white/10 bg-[#131315] text-white shadow-2xl">
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                <div className="size-12 animate-pulse rounded-full bg-white/5" />
                <div className="h-6 w-40 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-60 animate-pulse rounded bg-white/5" />
                <div className="my-4 h-14 w-64 animate-pulse rounded-md bg-white/5" />
                <div className="h-12 w-full animate-pulse rounded-md bg-white/5" />
            </CardContent>
        </Card>
    );
}

export default function ConfirmCodePage() {
    return (
        <Suspense fallback={<ConfirmCodeSkeleton />}>
            <ConfirmCodeForm />
        </Suspense>
    );
}
