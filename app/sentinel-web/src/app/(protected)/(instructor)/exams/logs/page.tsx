import { redirect } from 'next/navigation';
import { buildInstructorExamLogsHref } from '@/lib/routes/exam-management-routes';

export default async function InstructorExamLogsLegacyPage({
    searchParams,
}: {
    searchParams: Promise<{ examId?: string }>;
}) {
    const params = await searchParams;

    if (params.examId) {
        redirect(buildInstructorExamLogsHref(params.examId));
    }

    redirect('/exams');
}
