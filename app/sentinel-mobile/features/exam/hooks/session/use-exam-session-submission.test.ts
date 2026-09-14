import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Alert } from 'react-native';
import { completeExamSession } from '@sentinel/services';
import {
    clearStoredMobileExamPreview,
    clearStoredMobileExamSession,
    writeStoredMobileExamPreview,
} from '@/features/exam/lib/mobile-exam-storage';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';

let mockSetIsSubmitting = vi.fn();

vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        default: actual,
        useState: (initial: any) => [initial, mockSetIsSubmitting],
        useCallback: (fn: any) => fn,
        useRef: (initial: any) => ({ current: initial }),
    };
});

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}));

vi.mock('@sentinel/services', () => ({
    completeExamSession: vi.fn(),
}));

vi.mock('@/features/exam/lib/mobile-exam-storage', () => ({
    clearStoredMobileExamPreview: vi.fn().mockResolvedValue(undefined),
    clearStoredMobileExamSession: vi.fn().mockResolvedValue(undefined),
    writeStoredMobileExamPreview: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-native', () => ({
    Alert: {
        alert: vi.fn(),
    },
}));

import { useExamSessionSubmission } from './use-exam-session-submission';

describe('useExamSessionSubmission', () => {
    const mockRouter = {
        replace: vi.fn(),
    };
    const defaultExam = {
        id: 'exam-123',
        title: 'Midterm',
        duration: 60,
    } as any;
    const defaultQuestions = [
        {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Question 1',
            points: 1,
            options: [{ id: 'opt-a', text: 'Option A' }],
        },
    ] as any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSetIsSubmitting = vi.fn();
    });

    it('submits successfully, triggers non-blocking invalidation, and navigates immediately to feedback', async () => {
        const mockResult = {
            attemptId: 'session-456',
            score: 10,
            completedAt: new Date().toISOString(),
        } as any;
        vi.mocked(completeExamSession).mockResolvedValue(mockResult);

        // Simulate a slow invalidateQueries that takes longer than router navigation
        let invalidateResolved = false;
        mockInvalidateQueries.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => {
                        invalidateResolved = true;
                        resolve(undefined);
                    }, 500);
                }),
        );

        const answersRef = { current: { q1: 'opt-a' } };
        const timeLeftRef = { current: 3000 };

        const submission = useExamSessionSubmission({
            id: 'exam-123',
            sessionId: 'session-456',
            exam: defaultExam,
            questions: defaultQuestions,
            answersRef,
            timeLeftRef,
            apiClient: {},
            router: mockRouter,
        });

        await submission.executeSubmission();

        // Verification: router.replace was called without waiting for invalidateQueries to finish
        expect(writeStoredMobileExamPreview).toHaveBeenCalledWith(
            'exam-123',
            expect.objectContaining({
                sessionId: 'session-456',
                summary: mockResult,
            }),
        );
        expect(clearStoredMobileExamSession).toHaveBeenCalledWith('exam-123');
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: EXAM_QUERY_KEYS.all,
        });
        expect(mockRouter.replace).toHaveBeenCalledWith(
            '/exam/exam-123/feedback?attemptId=session-456',
        );
        expect(invalidateResolved).toBe(false); // Non-blocking!
    });

    it('gracefully handles 409 conflict as idempotent success and navigates immediately to feedback', async () => {
        const conflictError = {
            status: 409,
            message: 'Exam session is already completed',
        };
        vi.mocked(completeExamSession).mockRejectedValue(conflictError);

        const answersRef = { current: {} };
        const timeLeftRef = { current: 3000 };

        const submission = useExamSessionSubmission({
            id: 'exam-123',
            sessionId: 'session-456',
            exam: defaultExam,
            questions: defaultQuestions,
            answersRef,
            timeLeftRef,
            apiClient: {},
            router: mockRouter,
        });

        await submission.executeSubmission();

        expect(clearStoredMobileExamPreview).toHaveBeenCalledWith('exam-123');
        expect(clearStoredMobileExamSession).toHaveBeenCalledWith('exam-123');
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: EXAM_QUERY_KEYS.all,
        });
        expect(mockRouter.replace).toHaveBeenCalledWith(
            '/exam/exam-123/feedback?attemptId=session-456',
        );
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('displays Alert.alert on unexpected submission errors without navigation', async () => {
        const networkError = new Error('Network timeout');
        vi.mocked(completeExamSession).mockRejectedValue(networkError);

        const answersRef = { current: {} };
        const timeLeftRef = { current: 3000 };

        const submission = useExamSessionSubmission({
            id: 'exam-123',
            sessionId: 'session-456',
            exam: defaultExam,
            questions: defaultQuestions,
            answersRef,
            timeLeftRef,
            apiClient: {},
            router: mockRouter,
        });

        await submission.executeSubmission();

        expect(Alert.alert).toHaveBeenCalledWith('Submission Failed', 'Network timeout');
        expect(mockRouter.replace).not.toHaveBeenCalled();
    });
});
