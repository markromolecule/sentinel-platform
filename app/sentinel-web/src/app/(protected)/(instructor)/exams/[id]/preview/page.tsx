import { redirect } from 'next/navigation';

export default async function ExamPreviewEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const sessionId = crypto.randomUUID();

    redirect(`/exams/${id}/preview/${sessionId}`);
}
