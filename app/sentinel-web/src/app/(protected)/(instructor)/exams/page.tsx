import { Suspense } from 'react';
import ExamsDashboardClient from '@/app/(protected)/(instructor)/exams/dashboard/page';
import { Spinner } from '@sentinel/ui';

export default function ExamsDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-96 flex-col items-center justify-center gap-3">
                    <Spinner className="size-8 text-primary" />
                </div>
            }
        >
            <ExamsDashboardClient />
        </Suspense>
    );
}
