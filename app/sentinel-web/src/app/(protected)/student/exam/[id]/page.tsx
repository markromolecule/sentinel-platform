import { redirect } from 'next/navigation';

export default async function ExamEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/student/exam/${id}/instruction`);
}
