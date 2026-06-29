import { Suspense } from 'react';
import { ReportLoading } from './_components/report-loading';
import { ExamReportPageContent } from './_components/exam-report-page-content';

/**
 * Main instructor detailed exam report page component.
 * Wraps the content in a Suspense boundary for SSR-safe search parameters handling.
 *
 * @param props - Component props containing parameters with target exam ID.
 */
export default function ExamReportPage({ params }: { params: Promise<{ examId: string }> }) {
    return (
        <Suspense fallback={<ReportLoading />}>
            <ExamReportPageContent params={params} />
        </Suspense>
    );
}
