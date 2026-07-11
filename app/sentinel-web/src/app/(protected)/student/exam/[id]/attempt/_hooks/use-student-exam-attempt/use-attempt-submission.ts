import { useRouter } from 'next/navigation';
import { scoreExamAttempt } from '@sentinel/shared';
import type { ExamAttemptAnswers, ExamConfiguration, ExamQuestion } from '@sentinel/shared/types';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';
import { writeStoredExamTurnInPreview } from '@/app/(protected)/student/exam/[id]/_lib/exam-turn-in-storage';
import type { AttemptMonitoringPhase } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring';

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
    suspendSecurityMonitoring: () => boolean;
    isBlocked?: boolean;
    setMonitoringPhase?: (phase: AttemptMonitoringPhase) => void;
};

/**
 * Hook to manage the submission process of a student's exam attempt.
 * Validates unanswered questions, transitions to the turn-in review state, and performs final cleanup before redirection.
 * 
 * @param args - Object containing exam, answer, and UI control arguments.
 * @returns Submit handler and turn-in redirection function.
 */
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
    isBlocked,
    setMonitoringPhase,
}: UseAttemptSubmissionArgs) {
    const router = useRouter();

    const proceedToTurnInReview = () => {
        if (isRedirectingToTurnIn || !sessionId || isBlocked) return;
        setMonitoringPhase?.('submitting');
        const monitoringSuspended = suspendSecurityMonitoring();

        if (!monitoringSuspended) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(
                    '[AttemptSubmission] Monitoring suspension failed before Turn In review.',
                    { examId, sessionId },
                );
            }
            return;
        }

        setIsRedirectingToTurnIn(true);

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
            if (!monitoringSuspended) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(
                        '[AttemptSubmission] Skipping fullscreen exit because monitoring was not suspended.',
                        { examId, sessionId },
                    );
                }
                return;
            }

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
        if (questions.length === 0 || isBlocked) return;
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
