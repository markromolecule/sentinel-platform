import { redirect } from 'next/navigation';
import { InstructorAssignmentContent } from './_components/assignment-content';
import { buildCoreExamAssignHref } from '@/lib/routes/exam-management-routes';

export default async function ProctorAssignmentPage({
    searchParams,
}: {
    searchParams: Promise<{ examId?: string }>;
}) {
    const params = await searchParams;

    if (params.examId) {
        redirect(buildCoreExamAssignHref(params.examId));
    }

    return <InstructorAssignmentContent />;
}
