import { ExamIncidentLogsContent } from '@/app/(protected)/exams/logs/_components/exam-incident-logs-content';

export default async function CoreExamLogsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <ExamIncidentLogsContent initialExamId={id} />;
}
