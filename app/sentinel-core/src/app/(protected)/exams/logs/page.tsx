import { redirect } from 'next/navigation';
import { buildCoreExamLogsHref } from '@/lib/routes/exam-management-routes';
import { ExamIncidentLogsContent } from './_components/exam-incident-logs-content';

export default async function ExamIncidentLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ examId?: string }>;
}) {
    const params = await searchParams;

    if (params.examId) {
        redirect(buildCoreExamLogsHref(params.examId));
    }

    return <ExamIncidentLogsContent />;
}
