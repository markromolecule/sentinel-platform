import { Suspense } from 'react';
import { HistoryDetailsContent } from '@/app/(protected)/student/history/_components/history-details-content';

/**
 * Canonical student history page for an exam detail entry without an attempt id.
 *
 * @param props - Route params containing the exam id.
 * @returns Suspended exam history details content.
 */
export default async function StudentHistoryExamPage({
    params,
}: {
    params: Promise<{ examId: string }>;
}) {
    const { examId } = await params;

    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="border-border/60 border px-6 py-14 text-center">
                        <p className="text-sm font-medium">Loading exam details...</p>
                    </div>
                </div>
            }
        >
            <HistoryDetailsContent examId={examId} />
        </Suspense>
    );
}
