import { useMemo } from 'react';
import { readStoredStudentExamFlow } from '../../_lib/student-exam-flow';

export type UseLobbyReadinessArgs = {
    examId: string;
    isMediaPipeValid: boolean;
};

export function useLobbyReadiness({ examId, isMediaPipeValid }: UseLobbyReadinessArgs) {
    const storedFlow = useMemo(() => readStoredStudentExamFlow(examId), [examId]);

    const hasCompletedFlow = useMemo(
        () => storedFlow.privacyAccepted && storedFlow.checkupCompleted && isMediaPipeValid,
        [isMediaPipeValid, storedFlow.checkupCompleted, storedFlow.privacyAccepted],
    );

    return {
        storedFlow,
        hasCompletedFlow,
    };
}
