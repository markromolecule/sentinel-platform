import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLobbyActions } from './use-lobby-actions';

const {
    mockUseApi,
    mockRouterPush,
    mockRouterReplace,
    mockStartExamSession,
    mockToastError,
    mockWriteStoredExamSession,
    mockWriteStoredExamAnswerDraft,
    mockWriteStoredLobbyEntryMarker,
    mockClearStoredExamSession,
    mockClearStoredExamTurnInPreview,
    mockGetStudentExamSessionAttemptId,
    mockIsStudentExamAlreadyTurnedInError,
} = vi.hoisted(() => ({
    mockUseApi: vi.fn(),
    mockRouterPush: vi.fn(),
    mockRouterReplace: vi.fn(),
    mockStartExamSession: vi.fn(),
    mockToastError: vi.fn(),
    mockWriteStoredExamSession: vi.fn(),
    mockWriteStoredExamAnswerDraft: vi.fn(),
    mockWriteStoredLobbyEntryMarker: vi.fn(),
    mockClearStoredExamSession: vi.fn(),
    mockClearStoredExamTurnInPreview: vi.fn(),
    mockGetStudentExamSessionAttemptId: vi.fn(),
    mockIsStudentExamAlreadyTurnedInError: vi.fn(() => false),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        replace: mockRouterReplace,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockUseApi(),
}));

vi.mock('@sentinel/services', () => ({
    startExamSession: (...args: unknown[]) => mockStartExamSession(...args),
}));

vi.mock('sonner', () => ({
    toast: {
        error: mockToastError,
    },
}));

vi.mock('../../_lib/exam-session-storage', () => ({
    clearStoredExamSession: (...args: unknown[]) => mockClearStoredExamSession(...args),
    writeStoredExamAnswerDraft: (...args: unknown[]) => mockWriteStoredExamAnswerDraft(...args),
    writeStoredExamSession: (...args: unknown[]) => mockWriteStoredExamSession(...args),
    writeStoredLobbyEntryMarker: (...args: unknown[]) => mockWriteStoredLobbyEntryMarker(...args),
}));

vi.mock('../../_lib/exam-turn-in-storage', () => ({
    clearStoredExamTurnInPreview: (...args: unknown[]) => mockClearStoredExamTurnInPreview(...args),
}));

vi.mock('../../_lib/student-exam-flow', () => ({
    buildStudentExamHref: (examId: string, step: string) => `/student/exam/${examId}/${step}`,
}));

vi.mock('../../_lib/student-exam-session-feedback', () => ({
    getStudentExamSessionAttemptId: (...args: unknown[]) =>
        mockGetStudentExamSessionAttemptId(...args),
    isStudentExamAlreadyTurnedInError: (...args: unknown[]) =>
        mockIsStudentExamAlreadyTurnedInError(...args),
    resolveStudentExamSessionError: () => 'Unable to start exam.',
}));

function createArgs(overrides?: Partial<Parameters<typeof useLobbyActions>[0]>) {
    return {
        examId: 'exam-1',
        configuration: {
            webSecurity: {
                full_screen_required: false,
            },
        },
        runtimeAccess: {
            state: 'lobby_waiting',
            reasonCode: 'LOBBY_WAITING',
            message: 'Waiting for instructor approval.',
            canStart: false,
            canResume: false,
            hasActiveAttempt: false,
            startsAt: null,
            endsAt: null,
            reopenedUntil: null,
        },
        storedSession: null,
        hasCompletedFlow: true,
        canEnterExam: false,
        ...overrides,
    } as Parameters<typeof useLobbyActions>[0];
}

describe('useLobbyActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseApi.mockReturnValue({ api: true });
        mockGetStudentExamSessionAttemptId.mockReturnValue(null);
        mockIsStudentExamAlreadyTurnedInError.mockReturnValue(false);
    });

    it('does not start a session when current access cannot enter the exam', async () => {
        const { result } = renderHook(() => useLobbyActions(createArgs()));

        await act(async () => {
            await result.current.handleEnterExam();
        });

        expect(mockStartExamSession).not.toHaveBeenCalled();
        expect(mockWriteStoredLobbyEntryMarker).not.toHaveBeenCalled();
        expect(mockRouterPush).not.toHaveBeenCalled();
        expect(mockToastError).toHaveBeenCalledWith('Waiting for instructor approval.');
    });

    it('redirects already turned-in sessions to the canonical attempt history route', async () => {
        const error = new Error('Already turned in');

        mockStartExamSession.mockRejectedValue(error);
        mockIsStudentExamAlreadyTurnedInError.mockReturnValue(true);
        mockGetStudentExamSessionAttemptId.mockReturnValue('attempt-123');

        const { result } = renderHook(() =>
            useLobbyActions(
                createArgs({
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
                    canEnterExam: true,
                }),
            ),
        );

        await act(async () => {
            await result.current.handleEnterExam();
        });

        expect(mockClearStoredExamTurnInPreview).toHaveBeenCalledWith('exam-1');
        expect(mockClearStoredExamSession).toHaveBeenCalledWith('exam-1');
        expect(mockRouterReplace).toHaveBeenCalledWith('/student/history/attempts/attempt-123');
        expect(mockToastError).not.toHaveBeenCalled();
    });
});
