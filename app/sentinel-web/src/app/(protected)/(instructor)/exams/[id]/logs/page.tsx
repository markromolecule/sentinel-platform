import { IncidentLogsView } from '@/features/exams/logs';

export default async function InstructorExamLogsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <IncidentLogsView examId={id} />;
}
