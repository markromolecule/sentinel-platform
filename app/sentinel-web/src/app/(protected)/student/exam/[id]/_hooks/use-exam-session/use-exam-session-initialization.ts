import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    readStoredExamSession,
    clearStoredExamSession,
    readStoredLobbyEntryMarker,
    clearStoredLobbyEntryMarker,
    readStoredExamAnswerDraft,
    type StoredExamSession,
} from '../../_lib/exam-session-storage';
import { readStoredExamTurnInPreview } from '../../_lib/exam-turn-in-storage';
import type { ExamAnswerValue } from '@/features/exams/_components/engine';

export function useExamSessionInitialization(args: {
    examId: string;
    onInitializeAnswers?: (answers: Record<string, ExamAnswerValue>) => void;
    onInitializeElapsedSeconds?: (seconds: number) => void;
}) {
    const { examId, onInitializeAnswers, onInitializeElapsedSeconds } = args;
    const router = useRouter();
    const [examSession, setExamSession] = useState<StoredExamSession | null>(() => {
        if (typeof window === 'undefined') return null;
        return readStoredExamSession(examId);
    });

    const [isInitializingSession, setIsInitializingSession] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isAttemptPage = window.location.pathname.endsWith('/attempt');
        const hasLobbyMarker = readStoredLobbyEntryMarker(examId);

        if (isAttemptPage && !hasLobbyMarker) {
            clearStoredExamSession(examId);
            router.replace(`/student/exam/${examId}/lobby`);
            return;
        }

        if (hasLobbyMarker) {
            clearStoredLobbyEntryMarker(examId);
        }

        const pendingTurnInPreview = readStoredExamTurnInPreview(examId);

        if (pendingTurnInPreview) {
            onInitializeAnswers?.(pendingTurnInPreview.answers as Record<string, ExamAnswerValue>);
            onInitializeElapsedSeconds?.(pendingTurnInPreview.elapsedSeconds);
        } else if (examSession?.sessionId) {
            const answerDraft = readStoredExamAnswerDraft(examId, examSession.sessionId);
            if (answerDraft) {
                onInitializeAnswers?.(answerDraft.answers);
                onInitializeElapsedSeconds?.(answerDraft.elapsedSeconds);
            }
        }
    }, [examId, examSession?.sessionId, onInitializeAnswers, onInitializeElapsedSeconds, router]);

    return {
        examSession,
        setExamSession,
        isInitializingSession,
        setIsInitializingSession,
    };
}
