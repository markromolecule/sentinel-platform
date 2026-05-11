import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentExamAttempt } from './index';

const {
    mockUseStudentExamData,
    mockUseExamSession,
    mockUseAttemptMonitoring,
    mockRouterReplace,
    mockReadStoredLobbyEntryMarker,
    mockReadStoredExamSession,
} = vi.hoisted(() => ({
    mockUseStudentExamData: vi.fn(),
    mockUseExamSession: vi.fn(),
    mockUseAttemptMonitoring: vi.fn(),
    mockRouterReplace: vi.fn(),
    mockReadStoredLobbyEntryMarker: vi.fn(),
    mockReadStoredExamSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => mockUseStudentExamData(),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-exam-session', () => ({
    useExamSession: (args: unknown) => mockUseExamSession(args),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

vi.mock('./use-attempt-monitoring', () => ({
    useAttemptMonitoring: (args: unknown) => mockUseAttemptMonitoring(args),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_lib/exam-turn-in-storage', () => ({
    writeStoredExamTurnInPreview: vi.fn(),
}));

vi.mock('@/app/(protected)/student/exam/[id]/_lib/exam-session-storage', async () => {
    const actual = await vi.importActual<
        typeof import('@/app/(protected)/student/exam/[id]/_lib/exam-session-storage')
    >('@/app/(protected)/student/exam/[id]/_lib/exam-session-storage');

    return {
        ...actual,
        readStoredLobbyEntryMarker: (examId: string) => mockReadStoredLobbyEntryMarker(examId),
        readStoredExamSession: (examId: string) => mockReadStoredExamSession(examId),
    };
});

function createQuestions(count: number) {
    return Array.from({ length: count }, (_, index) => ({
        id: `question-${index + 1}`,
        questionId: `question-${index + 1}`,
        orderIndex: index,
        points: 1,
        type: 'MULTIPLE_CHOICE',
        content: {
            prompt: `Question ${index + 1}`,
            options: ['A', 'B', 'C', 'D'],
        },
    })) as {
        id: string;
        questionId: string;
        orderIndex: number;
        points: number;
        type: string;
        content: {
            prompt: string;
            options: string[];
        };
    }[];
}

describe('useStudentExamAttempt', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseStudentExamData.mockReturnValue({
            examId: '11111111-1111-1111-1111-111111111111',
            exam: {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Attempt test',
                description: 'Attempt test description',
                duration: 60,
                status: 'available',
                runtimeAccess: {
                    canStart: true,
                    canResume: false,
                    hasActiveAttempt: true,
                },
            },
            configuration: {
                cameraRequired: false,
            },
            mediaPipeSandbox: null,
            questions: createQuestions(10),
            isLoading: false,
        });

        mockUseExamSession.mockReturnValue({
            examSession: {
                sessionId: '22222222-2222-2222-2222-222222222222',
                configSnapshot: null,
            },
            isInitializingSession: false,
            elapsedSeconds: 120,
            secondsRemaining: 1800,
            saveAnswerDraft: vi.fn(),
            syncProgress: vi.fn(),
        });

        mockUseAttemptMonitoring.mockReturnValue({
            mediaPipeVideoRef: { current: null },
            mediaPipeAnalysis: null,
            mediaPipePhase: 'idle',
            mediaPipeErrorMessage: null,
            mediaPipeIncident: null,
            dismissMediaPipeIncident: vi.fn(),
            isMediaPipeEnabled: false,
            audioErrorMessage: null,
            audioMonitoringPhase: 'idle',
            isAudioMonitoringEnabled: false,
            securityLockReason: null,
            isResumingExam: false,
            resumeSecuredExam: vi.fn(),
            fullScreenContainerRef: { current: null },
            suspendSecurityMonitoring: vi.fn(),
        });

        mockReadStoredLobbyEntryMarker.mockReturnValue(true);
        mockReadStoredExamSession.mockReturnValue(null);
    });

    it('reports zero unanswered questions when every question has a valid answer', () => {
        const { result } = renderHook(() => useStudentExamAttempt());

        act(() => {
            result.current.questions.forEach((question) => {
                result.current.handleAnswerChange(question.id, 'A');
            });
        });

        expect(result.current.answeredCount).toBe(10);
        expect(result.current.unansweredCount).toBe(0);
        expect(result.current.unansweredQuestionLabels).toEqual([]);
    });

    it('reports empty string answers as unanswered', () => {
        const { result } = renderHook(() => useStudentExamAttempt());

        act(() => {
            result.current.questions.forEach((question, index) => {
                result.current.handleAnswerChange(question.id, index < 2 ? '' : 'A');
            });
        });

        expect(result.current.answeredCount).toBe(8);
        expect(result.current.unansweredCount).toBe(2);
        expect(result.current.unansweredQuestionLabels).toEqual(['Q1', 'Q2']);
    });

    it('keeps the attempt page active after valid lobby entry', () => {
        renderHook(() => useStudentExamAttempt());

        expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('allows a hard reload when a stored session exists', () => {
        mockReadStoredLobbyEntryMarker.mockReturnValue(false);
        mockReadStoredExamSession.mockReturnValue({
            examId: '11111111-1111-1111-1111-111111111111',
            sessionId: '22222222-2222-2222-2222-222222222222',
            storedAt: '2026-05-11T00:00:00.000Z',
            isResumed: false,
            configSnapshot: null,
        });

        renderHook(() => useStudentExamAttempt());

        expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('allows a resumable active attempt without a lobby marker', () => {
        mockReadStoredLobbyEntryMarker.mockReturnValue(false);
        mockUseStudentExamData.mockReturnValue({
            examId: '11111111-1111-1111-1111-111111111111',
            exam: {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'Attempt test',
                description: 'Attempt test description',
                duration: 60,
                status: 'available',
                runtimeAccess: {
                    canStart: false,
                    canResume: true,
                    hasActiveAttempt: true,
                },
            },
            configuration: {
                cameraRequired: false,
            },
            mediaPipeSandbox: null,
            questions: createQuestions(10),
            isLoading: false,
        });

        renderHook(() => useStudentExamAttempt());

        expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('redirects direct attempt access without a lobby marker or stored session', () => {
        mockReadStoredLobbyEntryMarker.mockReturnValue(false);

        renderHook(() => useStudentExamAttempt());

        expect(mockRouterReplace).toHaveBeenCalledWith(
            '/student/exam/11111111-1111-1111-1111-111111111111/lobby',
        );
    });
});
