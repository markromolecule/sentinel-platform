import { InstructorAssignmentContent } from '@/app/(protected)/exams/assign/_components/assignment-content';

export default async function CoreExamAssignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <InstructorAssignmentContent initialExamId={id} />;
}
