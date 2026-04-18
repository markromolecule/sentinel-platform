import { useEffect, useState } from 'react';
import { useApi } from '@sentinel/hooks';
import { startExamSession } from '@sentinel/services';
import { toast } from 'sonner';
import {
    readStoredExamSession,
    writeStoredExamSession,
    type StoredExamSession,
} from '../_lib/exam-session-storage';
import { readStoredExamTurnInPreview } from '../_lib/exam-turn-in-storage';
import { resolveStudentExamSessionError } from '../_lib/student-exam-session-feedback';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

type UseExamSessionArgs = {
    examId: string;
    examDurationMinutes?: number;
    isLoadingData?: boolean;
    onInitializeAnswers?: (answers: Record<string, ExamAnswerValue>) => void;
    onInitializeElapsedSeconds?: (seconds: number) => void;
};

export function useExamSession({
    examId,
    examDurationMinutes,
    isLoadingData,
    onInitializeAnswers,
    onInitializeElapsedSeconds,
}: UseExamSessionArgs) {
    const apiClient = useApi();
    const [examSession, setExamSession] = useState<StoredExamSession | null>(null);
    const [isInitializingSession, setIsInitializingSession] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        setExamSession(readStoredExamSession(examId));
        const pendingTurnInPreview = readStoredExamTurnInPreview(examId);

        if (pendingTurnInPreview) {
            onInitializeAnswers?.(pendingTurnInPreview.answers as Record<string, ExamAnswerValue>);
            onInitializeElapsedSeconds?.(pendingTurnInPreview.elapsedSeconds);
            setElapsedSeconds(pendingTurnInPreview.elapsedSeconds);
        }

        setIsInitializingSession(false);
    }, [examId, onInitializeAnswers, onInitializeElapsedSeconds]);

    useEffect(() => {
        if (!examDurationMinutes) {
            return;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds((current) => current + 1);
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [examDurationMinutes]);

    useEffect(() => {
        if (isLoadingData || examSession || isInitializingSession) {
            return;
        }

        let isActive = true;
        setIsInitializingSession(true);

        const initializeExamSession = async () => {
            try {
                const session = await startExamSession(apiClient, { examId });
                const storedSession = writeStoredExamSession(examId, session);

                if (!storedSession) {
                    throw new Error('Exam session could not be initialized.');
                }

                if (isActive) {
                    setExamSession(storedSession);
                }
            } catch (error) {
                if (!isActive) {
                    return;
                }

                toast.error(resolveStudentExamSessionError(error));
            } finally {
                if (isActive) {
                    setIsInitializingSession(false);
                }
            }
        };

        void initializeExamSession();

        return () => {
            isActive = false;
        };
    }, [apiClient, examId, examSession, isInitializingSession, isLoadingData]);

    const secondsRemaining = Math.max((examDurationMinutes ?? 0) * 60 - elapsedSeconds, 0);

    return {
        examSession,
        isInitializingSession,
        elapsedSeconds,
        secondsRemaining,
        setElapsedSeconds,
    };
}
