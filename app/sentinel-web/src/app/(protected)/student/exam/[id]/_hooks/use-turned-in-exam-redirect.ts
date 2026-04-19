'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearStoredExamSession } from '../_lib/exam-session-storage';
import { clearStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';

type UseTurnedInExamRedirectArgs = {
    examId: string;
    status?: string | null;
    attemptId?: string | null;
};

export function useTurnedInExamRedirect({
    examId,
    status,
    attemptId,
}: UseTurnedInExamRedirectArgs) {
    const router = useRouter();
    const isRedirecting = status === 'turned_in' && Boolean(attemptId);

    useEffect(() => {
        if (!isRedirecting || !attemptId) {
            return;
        }

        clearStoredExamTurnInPreview(examId);
        clearStoredExamSession(examId);
        router.replace(`/student/history/details?attemptId=${attemptId}`);
    }, [attemptId, examId, isRedirecting, router]);

    return isRedirecting;
}
