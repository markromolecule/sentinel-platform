import { Suspense } from 'react';
import ExamsDashboardClient from '@/app/(protected)/(instructor)/exams/dashboard/page';

export default function ExamsDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-96 flex-col items-center justify-center gap-3">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground text-sm">Loading exams...</p>
                </div>
            }
        >
            <ExamsDashboardClient />
        </Suspense>
    );
}
