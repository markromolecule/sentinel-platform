import { useState, useRef, useCallback, type MutableRefObject } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { completeExamSession } from '@sentinel/services';
import { buildSessionAnswerPayload } from '@/features/exam/lib/mobile-exam-adapter';
import {
    clearStoredMobileExamSession,
    writeStoredMobileExamPreview,
} from '@/features/exam/lib/mobile-exam-storage';
import type { MobileExamDisplay, MobileSessionQuestion } from '@/features/exam/lib/mobile-exam-adapter.types';

interface UseExamSessionSubmissionOptions {
    id?: string;
    sessionId?: string;
    exam?: MobileExamDisplay;
    questions: MobileSessionQuestion[];
    answersRef: MutableRefObject<Record<string, any>>;
    timeLeftRef: MutableRefObject<number>;
    apiClient: any;
    router: { replace: (url: string) => void };
}

export function useExamSessionSubmission({
    id,
    sessionId,
    exam,
    questions,
    answersRef,
    timeLeftRef,
    apiClient,
    router,
}: UseExamSessionSubmissionOptions) {
    let queryClient: any = null;
    try {
        queryClient = useQueryClient();
    } catch {
        // Safely ignore when called outside QueryClientProvider in test harness
    }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const executeSubmission = useCallback(async () => {
        if (!id || !sessionId || !exam || isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            const currentAnswers = answersRef.current;
            const answerPayload = buildSessionAnswerPayload(questions, currentAnswers);
            const elapsed = Math.max(0, (exam.duration || 60) * 60 - timeLeftRef.current);

            const result = await completeExamSession(apiClient, {
                sessionId,
                answers: answerPayload,
                elapsedSeconds: elapsed,
            });

            const preview = {
                sessionId,
                answers: answerPayload,
                elapsedSeconds: elapsed,
                summary: result,
                completedAt: result?.completedAt || new Date().toISOString(),
            };

            await writeStoredMobileExamPreview(id, preview);
            await clearStoredMobileExamSession(id);
            await queryClient?.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all });

            router.replace(`/exam/${id}/feedback?attemptId=${sessionId}`);
        } catch (error: any) {
            Alert.alert(
                'Submission Failed',
                error?.message || 'Failed to submit exam. Please try again.',
            );
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    }, [apiClient, exam, id, questions, router, sessionId, answersRef, timeLeftRef, queryClient]);

    return {
        isSubmitting,
        isSubmittingRef,
        executeSubmission,
    };
}
