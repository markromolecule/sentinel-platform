import { redirect } from 'next/navigation';

export default async function ExamDetailsPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const params = await searchParams;

    if (params.id) {
        redirect(`/student/exam/${params.id}/instruction`);
    }

    redirect('/student/exam');
}
