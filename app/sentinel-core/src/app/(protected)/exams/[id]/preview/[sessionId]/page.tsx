import { redirect } from 'next/navigation';

export default async function ExamPreviewIndexPage({
    params,
}: {
    params: Promise<{ id: string; sessionId: string }>;
}) {
    const { id, sessionId } = await params;

    redirect(`/exams/${id}/preview/${sessionId}/instruction`);
}
