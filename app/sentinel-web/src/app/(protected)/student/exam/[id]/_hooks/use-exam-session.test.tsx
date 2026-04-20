import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamSession } from './use-exam-session';

const {
    mockRouterReplace,
    mockApiClient,
    mockStartExamSession,
    mockToastError,
    mockReadStoredExamSession,
    mockWriteStoredExamSession,
    mockClearStoredExamSession,
    mockReadStoredExamTurnInPreview,
    mockClearStoredExamTurnInPreview,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockApiClient: vi.fn(),
    mockStartExamSession: vi.fn(),
    mockToastError: vi.fn(),
    mockReadStoredExamSession: vi.fn(),
    mockWriteStoredExamSession: vi.fn(),
    mockClearStoredExamSession: vi.fn(),
    mockReadStoredExamTurnInPreview: vi.fn(),
    mockClearStoredExamTurnInPreview: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
}));

vi.mock('@sentinel/services', () => ({
    startExamSession: mockStartExamSession,
}));

vi.mock('sonner', () => ({
    toast: {
        error: mockToastError,
    },
}));

vi.mock('../_lib/exam-session-storage', () => ({
    readStoredExamSession: mockReadStoredExamSession,
    writeStoredExamSession: mockWriteStoredExamSession,
    clearStoredExamSession: mockClearStoredExamSession,
}));

vi.mock('../_lib/exam-turn-in-storage', () => ({
    readStoredExamTurnInPreview: mockReadStoredExamTurnInPreview,
    clearStoredExamTurnInPreview: mockClearStoredExamTurnInPreview,
}));

vi.mock('../_lib/student-exam-session-feedback', () => ({
    getStudentExamSessionAttemptId: vi.fn(),
    isStudentExamAlreadyTurnedInError: vi.fn(() => false),
    resolveStudentExamSessionError: vi.fn(() => 'Failed to prepare the exam session.'),
}));

describe('useExamSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockReadStoredExamTurnInPreview.mockReturnValue(null);
    });

    it('keeps the stored session when the exam is still open for new starts', async () => {
        const storedSession = {
            examId: '11111111-1111-1111-1111-111111111111',
            sessionId: '22222222-2222-2222-2222-222222222222',
            storedAt: '2026-04-20T10:00:00.000Z',
        };

        mockReadStoredExamSession.mockReturnValue(storedSession);

        const { result } = renderHook(() =>
            useExamSession({
                examId: storedSession.examId,
                runtimeAccess: {
                    state: 'open',
                    reasonCode: 'OPEN',
                    message: 'This exam is open for students.',
                    canStart: true,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
                isLoadingData: false,
                isSessionStartBlocked: false,
            }),
        );

        await waitFor(() => {
            expect(result.current.isInitializingSession).toBe(false);
        });

        expect(result.current.examSession).toEqual(storedSession);
        expect(mockClearStoredExamSession).not.toHaveBeenCalled();
        expect(mockToastError).not.toHaveBeenCalled();
        expect(mockRouterReplace).not.toHaveBeenCalled();
        expect(mockStartExamSession).not.toHaveBeenCalled();
    });

    it('clears the stored session when the exam can no longer be started or resumed', async () => {
        const storedSession = {
            examId: '11111111-1111-1111-1111-111111111111',
            sessionId: '22222222-2222-2222-2222-222222222222',
            storedAt: '2026-04-20T10:00:00.000Z',
        };

        mockReadStoredExamSession.mockReturnValue(storedSession);

        const { result } = renderHook(() =>
            useExamSession({
                examId: storedSession.examId,
                runtimeAccess: {
                    state: 'locked',
                    reasonCode: 'LOCKED',
                    message: 'This exam is locked by the instructor.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
                isLoadingData: false,
                isSessionStartBlocked: false,
            }),
        );

        await waitFor(() => {
            expect(result.current.examSession).toBeNull();
        });

        expect(mockClearStoredExamSession).toHaveBeenCalledWith(storedSession.examId);
        expect(mockToastError).toHaveBeenCalledWith('This exam is locked by the instructor.');
        expect(mockRouterReplace).toHaveBeenCalledWith(
            `/student/exam/${storedSession.examId}/lobby`,
        );
    });
});
