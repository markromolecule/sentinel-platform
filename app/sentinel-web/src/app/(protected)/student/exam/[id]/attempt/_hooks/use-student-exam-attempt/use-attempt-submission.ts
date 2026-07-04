import { useRouter } from 'next/navigation';
import { scoreExamAttempt } from '@sentinel/shared';
import type { ExamAttemptAnswers, ExamConfiguration, ExamQuestion } from '@sentinel/shared/types';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';
import { writeStoredExamTurnInPreview } from '@/app/(protected)/student/exam/[id]/_lib/exam-turn-in-storage';

export type UseAttemptSubmissionArgs = {
    examId: string;
    sessionId?: string;
    releaseScoreMode: NonNullable<ExamConfiguration['releaseScoreMode']>;
    questions: ExamQuestion[];
    selectedAnswers: Record<string, ExamAnswerValue>;
    elapsedSeconds: number;
    unansweredCount: number;
    isRedirectingToTurnIn: boolean;
    setIsRedirectingToTurnIn: (val: boolean) => void;
    setIsSubmitDialogOpen: (val: boolean) => void;
    suspendSecurityMonitoring: () => void;
};

export function useAttemptSubmission({
    examId,
    sessionId,
    releaseScoreMode,
    questions,
    selectedAnswers,
    elapsedSeconds,
    unansweredCount,
    isRedirectingToTurnIn,
    setIsRedirectingToTurnIn,
    setIsSubmitDialogOpen,
    suspendSecurityMonitoring,
}: UseAttemptSubmissionArgs) {
    const router = useRouter();

    const proceedToTurnInReview = () => {
        if (isRedirectingToTurnIn || !sessionId) return;
        setIsRedirectingToTurnIn(true);
        suspendSecurityMonitoring();

        const summary = scoreExamAttempt({
            questions,
            answers: selectedAnswers as ExamAttemptAnswers,
        });
        const scoreVisible = releaseScoreMode === 'AUTO_RELEASE';

        writeStoredExamTurnInPreview({
            examId,
            sessionId: sessionId,
            answers: selectedAnswers as ExamAttemptAnswers,
            elapsedSeconds,
            releaseScoreMode,
            scoreVisible,
            summary: {
                ...summary,
                score: scoreVisible ? summary.score : null,
                totalScore: scoreVisible ? summary.totalScore : null,
                percentage: scoreVisible ? summary.percentage : null,
            },
            storedAt: new Date().toISOString(),
        });

        router.replace(`/student/exam/${examId}/result`);

        window.setTimeout(() => {
            if (typeof document === 'undefined' || !document.fullscreenElement) {
                return;
            }

            const fullscreenExit = document.exitFullscreen?.();

            fullscreenExit?.catch((err) => {
                console.error('Error attempting to exit full-screen mode:', err);
            });
        }, 0);
    };

    const handleSubmit = () => {
        if (questions.length === 0) return;
        if (unansweredCount > 0) {
            setIsSubmitDialogOpen(true);
            return;
        }
        proceedToTurnInReview();
    };

    return {
        handleSubmit,
        proceedToTurnInReview,
    };
}
