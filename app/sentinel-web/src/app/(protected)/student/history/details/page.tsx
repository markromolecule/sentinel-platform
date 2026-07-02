import { redirect } from 'next/navigation';
import {
    buildStudentHistoryAttemptHref,
    buildStudentHistoryExamHref,
} from '@/lib/routes/student-history-routes';

/**
 * Legacy student history entry point that redirects query-string history URLs
 * to their canonical RESTful routes.
 *
 * @param props - Legacy query-string search params.
 */
export default async function HistoryDetailsPage({
    searchParams,
}: {
    searchParams: Promise<{ attemptId?: string; examId?: string; id?: string }>;
}) {
    const params = await searchParams;

    if (params.attemptId) {
        redirect(buildStudentHistoryAttemptHref(params.attemptId));
    }

    if (params.examId ?? params.id) {
        redirect(buildStudentHistoryExamHref(params.examId ?? params.id ?? ''));
    }

    redirect('/student/history');
}
