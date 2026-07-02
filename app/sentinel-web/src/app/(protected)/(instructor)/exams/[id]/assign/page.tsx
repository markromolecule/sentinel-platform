import { InstructorAssignmentContent } from '@/app/(protected)/(instructor)/exams/assign/_components/assignment-content';

export default async function InstructorExamAssignPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <InstructorAssignmentContent initialExamId={id} />;
}
