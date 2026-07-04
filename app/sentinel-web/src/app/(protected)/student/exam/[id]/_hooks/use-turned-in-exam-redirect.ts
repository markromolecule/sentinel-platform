'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { clearStoredExamSession } from '../_lib/exam-session-storage';
import { clearStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';
import { buildStudentHistoryAttemptHref } from '@/lib/routes/student-history-routes';

type UseTurnedInExamRedirectArgs = {
    examId: string;
    status?: string | null;
    attemptId?: string | null;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export function useTurnedInExamRedirect({
    examId,
    status,
    attemptId,
    runtimeAccess,
}: UseTurnedInExamRedirectArgs) {
    const router = useRouter();
    const isOverrideActive = Boolean(runtimeAccess?.canStart || runtimeAccess?.canResume);
    const isRedirecting = status === 'turned_in' && Boolean(attemptId) && !isOverrideActive;

    useEffect(() => {
        if (!isRedirecting || !attemptId) {
            return;
        }

        clearStoredExamTurnInPreview(examId);
        clearStoredExamSession(examId);
        router.replace(buildStudentHistoryAttemptHref(attemptId));
    }, [attemptId, examId, isRedirecting, router]);

    return isRedirecting;
}
