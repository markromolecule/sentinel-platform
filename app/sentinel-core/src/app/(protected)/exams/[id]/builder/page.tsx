import { Suspense } from 'react';
import { ExamBuilderScreen } from './_components';

export default function ExamBuilderPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen flex-col items-center justify-center gap-3">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground text-sm">Loading builder...</p>
                </div>
            }
        >
            <ExamBuilderScreen />
        </Suspense>
    );
}
