import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamSession } from './use-exam-session';

const {
    mockRouterReplace,
    mockApiClient,
    mockStartExamSession,
    mockSyncExamProgress,
    mockToastError,
    mockReadStoredExamSession,
    mockWriteStoredExamSession,
    mockClearStoredExamSession,
    mockReadStoredExamAnswerDraft,
    mockWriteStoredExamAnswerDraft,
    mockReadStoredExamTurnInPreview,
    mockClearStoredExamTurnInPreview,
    mockReadStoredLobbyEntryMarker,
    mockClearStoredLobbyEntryMarker,
    mockGetStudentExamSessionAttemptId,
    mockIsStudentExamAlreadyTurnedInError,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockApiClient: vi.fn(),
    mockStartExamSession: vi.fn(),
    mockSyncExamProgress: vi.fn(),
    mockToastError: vi.fn(),
    mockReadStoredExamSession: vi.fn(),
    mockWriteStoredExamSession: vi.fn(),
    mockClearStoredExamSession: vi.fn(),
    mockReadStoredExamAnswerDraft: vi.fn(),
    mockWriteStoredExamAnswerDraft: vi.fn(),
    mockReadStoredExamTurnInPreview: vi.fn(),
    mockClearStoredExamTurnInPreview: vi.fn(),
    mockReadStoredLobbyEntryMarker: vi.fn(),
    mockClearStoredLobbyEntryMarker: vi.fn(),
    mockGetStudentExamSessionAttemptId: vi.fn(),
    mockIsStudentExamAlreadyTurnedInError: vi.fn(() => false),
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
    syncExamProgress: mockSyncExamProgress,
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
    readStoredExamAnswerDraft: mockReadStoredExamAnswerDraft,
    writeStoredExamAnswerDraft: mockWriteStoredExamAnswerDraft,
    readStoredLobbyEntryMarker: mockReadStoredLobbyEntryMarker,
    clearStoredLobbyEntryMarker: mockClearStoredLobbyEntryMarker,
}));

vi.mock('../_lib/exam-turn-in-storage', () => ({
    readStoredExamTurnInPreview: mockReadStoredExamTurnInPreview,
    clearStoredExamTurnInPreview: mockClearStoredExamTurnInPreview,
}));

vi.mock('../_lib/student-exam-session-feedback', () => ({
    getStudentExamSessionAttemptId: (...args: unknown[]) => mockGetStudentExamSessionAttemptId(...args),
    isStudentExamAlreadyTurnedInError: (...args: unknown[]) =>
        mockIsStudentExamAlreadyTurnedInError(...args),
    resolveStudentExamSessionError: vi.fn(() => 'Failed to prepare the exam session.'),
}));

function mockAttemptLocation(examId: string) {
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...originalLocation, pathname: `/student/exam/${examId}/attempt` },
    });

    return () => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
    };
}

describe('useExamSession', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
        mockReadStoredExamSession.mockReturnValue(null);
        mockReadStoredExamTurnInPreview.mockReturnValue(null);
        mockReadStoredExamAnswerDraft.mockReturnValue(null);
        mockReadStoredLobbyEntryMarker.mockReturnValue(true);
        mockSyncExamProgress.mockResolvedValue({
            message: 'Session progress synced successfully.',
        });
        mockGetStudentExamSessionAttemptId.mockReturnValue(null);
        mockIsStudentExamAlreadyTurnedInError.mockReturnValue(false);
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

    it('restores cached answer drafts for a stored active session', async () => {
        const storedSession = {
            examId: '11111111-1111-1111-1111-111111111111',
            sessionId: '22222222-2222-2222-2222-222222222222',
            storedAt: '2026-04-20T10:00:00.000Z',
        };
        const onInitializeAnswers = vi.fn();
        const onInitializeElapsedSeconds = vi.fn();

        mockReadStoredExamSession.mockReturnValue(storedSession);
        mockReadStoredExamAnswerDraft.mockReturnValue({
            examId: storedSession.examId,
            sessionId: storedSession.sessionId,
            answers: {
                'question-1': 'B',
            },
            elapsedSeconds: 95,
            storedAt: '2026-04-20T10:01:00.000Z',
        });

        const { result } = renderHook(() =>
            useExamSession({
                examId: storedSession.examId,
                runtimeAccess: {
                    state: 'open',
                    reasonCode: 'OPEN',
                    message: 'This exam is open for students.',
                    canStart: true,
                    canResume: true,
                    hasActiveAttempt: true,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
                isLoadingData: false,
                isSessionStartBlocked: false,
                onInitializeAnswers,
                onInitializeElapsedSeconds,
            }),
        );

        await waitFor(() => {
            expect(result.current.elapsedSeconds).toBe(95);
        });

        expect(onInitializeAnswers).toHaveBeenCalledWith({
            'question-1': 'B',
        });
        expect(onInitializeElapsedSeconds).toHaveBeenCalledWith(95);
    });

    it('keeps an already-active stored session when runtime access later blocks new starts', async () => {
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
            expect(result.current.examSession).toEqual(storedSession);
        });

        expect(mockClearStoredExamSession).not.toHaveBeenCalled();
        expect(mockToastError).not.toHaveBeenCalled();
        expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('starts and stores a new exam session when no cached session exists and runtime access allows it', async () => {
        const startedSession = {
            sessionId: '22222222-2222-2222-2222-222222222222',
            examId: '11111111-1111-1111-1111-111111111111',
        };
        const storedSession = {
            examId: startedSession.examId,
            sessionId: startedSession.sessionId,
            storedAt: '2026-04-22T08:00:00.000Z',
        };

        mockReadStoredExamSession.mockReturnValue(null);
        mockStartExamSession.mockResolvedValue(startedSession);
        mockWriteStoredExamSession.mockReturnValue(storedSession);
        const runtimeAccess = {
            state: 'open' as const,
            reasonCode: 'OPEN' as const,
            message: 'This exam is open for students.',
            canStart: true,
            canResume: false,
            hasActiveAttempt: false,
            startsAt: null,
            endsAt: null,
            reopenedUntil: null,
        };

        renderHook(() =>
            useExamSession({
                examId: startedSession.examId,
                runtimeAccess,
                isLoadingData: false,
                isSessionStartBlocked: false,
            }),
        );

        await waitFor(() => {
            expect(mockStartExamSession).toHaveBeenCalledWith(mockApiClient, {
                examId: startedSession.examId,
            });
            expect(mockWriteStoredExamSession).toHaveBeenCalledWith(
                startedSession.examId,
                startedSession,
            );
        });
    });

    it('persists server-restored answers when a session is resumed remotely', async () => {
        const startedSession = {
            sessionId: '22222222-2222-2222-2222-222222222222',
            examId: '11111111-1111-1111-1111-111111111111',
            isResumed: true,
            answers: {
                'question-1': 'C',
            },
            elapsedSeconds: 180,
        };
        const storedSession = {
            examId: startedSession.examId,
            sessionId: startedSession.sessionId,
            storedAt: '2026-04-22T08:00:00.000Z',
        };
        const onInitializeAnswers = vi.fn();

        mockReadStoredExamSession.mockReturnValue(null);
        mockStartExamSession.mockResolvedValue(startedSession);
        mockWriteStoredExamSession.mockReturnValue(storedSession);

        renderHook(() =>
            useExamSession({
                examId: startedSession.examId,
                runtimeAccess: {
                    state: 'open',
                    reasonCode: 'OPEN',
                    message: 'This exam is open for students.',
                    canStart: true,
                    canResume: true,
                    hasActiveAttempt: true,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
                isLoadingData: false,
                isSessionStartBlocked: false,
                onInitializeAnswers,
            }),
        );

        await waitFor(() => {
            expect(mockStartExamSession).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockWriteStoredExamSession).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockWriteStoredExamAnswerDraft).toHaveBeenCalled();
        });

        expect(mockWriteStoredExamAnswerDraft).toHaveBeenCalledWith({
            examId: startedSession.examId,
            sessionId: startedSession.sessionId,
            answers: startedSession.answers,
            elapsedSeconds: 180,
        });
    });

    it('does not auto-start a new session when attempt startup is blocked', async () => {
        mockReadStoredExamSession.mockReturnValue(null);
        const runtimeAccess = {
            state: 'locked' as const,
            reasonCode: 'LOCKED' as const,
            message: 'This exam is locked by the instructor.',
            canStart: false,
            canResume: false,
            hasActiveAttempt: false,
            startsAt: null,
            endsAt: null,
            reopenedUntil: null,
        };

        const { result } = renderHook(() =>
            useExamSession({
                examId: '11111111-1111-1111-1111-111111111111',
                runtimeAccess,
                isLoadingData: false,
                isSessionStartBlocked: true,
            }),
        );

        await waitFor(() => {
            expect(result.current.isInitializingSession).toBe(false);
            expect(result.current.examSession).toBeNull();
        });

        expect(mockStartExamSession).not.toHaveBeenCalled();
        expect(mockWriteStoredExamSession).not.toHaveBeenCalled();
    });

    it('redirects already turned-in session starts to the canonical attempt history route', async () => {
        const error = new Error('Already turned in');

        mockReadStoredExamSession.mockReturnValue(null);
        mockStartExamSession.mockRejectedValue(error);
        mockIsStudentExamAlreadyTurnedInError.mockReturnValue(true);
        mockGetStudentExamSessionAttemptId.mockReturnValue('attempt-789');

        renderHook(() =>
            useExamSession({
                examId: '11111111-1111-1111-1111-111111111111',
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
            expect(mockStartExamSession).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith(
                '/student/history/attempts/attempt-789',
            );
        });

        expect(mockClearStoredExamTurnInPreview).toHaveBeenCalledWith(
            '11111111-1111-1111-1111-111111111111',
        );
        expect(mockClearStoredExamSession).toHaveBeenCalledWith(
            '11111111-1111-1111-1111-111111111111',
        );
        expect(mockToastError).not.toHaveBeenCalled();
    });

    it('redirects to the lobby if the lobby entry marker is missing on the attempt page', async () => {
        const examId = '11111111-1111-1111-1111-111111111111';
        const restoreLocation = mockAttemptLocation(examId);

        mockReadStoredLobbyEntryMarker.mockReturnValue(false);

        renderHook(() =>
            useExamSession({
                examId,
                runtimeAccess: {
                    state: 'open',
                    reasonCode: 'OPEN',
                    message: 'This exam is open for students.',
                    canStart: true,
                    canResume: true,
                    hasActiveAttempt: true,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
                isLoadingData: false,
                isSessionStartBlocked: false,
            }),
        );

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith(`/student/exam/${examId}/lobby`);
        });

        restoreLocation();
    });

    it('does not redirect from the attempt page when a valid stored session exists without a lobby marker', async () => {
        const examId = '11111111-1111-1111-1111-111111111111';
        const restoreLocation = mockAttemptLocation(examId);
        const storedSession = {
            examId,
            sessionId: '22222222-2222-2222-2222-222222222222',
            storedAt: '2026-04-20T10:00:00.000Z',
        };

        mockReadStoredExamSession.mockReturnValue(storedSession);
        mockReadStoredLobbyEntryMarker.mockReturnValue(false);

        const { result } = renderHook(() =>
            useExamSession({
                examId,
                runtimeAccess: {
                    state: 'open',
                    reasonCode: 'OPEN',
                    message: 'This exam is open for students.',
                    canStart: false,
                    canResume: true,
                    hasActiveAttempt: true,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
                isLoadingData: false,
                isSessionStartBlocked: false,
            }),
        );

        await waitFor(() => {
            expect(result.current.examSession).toEqual(storedSession);
        });

        expect(mockRouterReplace).not.toHaveBeenCalled();
        expect(mockClearStoredLobbyEntryMarker).not.toHaveBeenCalled();

        restoreLocation();
    });

    it('consumes a lobby marker without redirecting when a fresh attempt enters normally', async () => {
        const examId = '11111111-1111-1111-1111-111111111111';
        const restoreLocation = mockAttemptLocation(examId);

        mockReadStoredExamSession.mockReturnValue(null);
        mockReadStoredLobbyEntryMarker.mockReturnValue(true);

        const { result } = renderHook(() =>
            useExamSession({
                examId,
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
                isSessionStartBlocked: true,
            }),
        );

        await waitFor(() => {
            expect(result.current.isInitializingSession).toBe(false);
        });

        expect(mockClearStoredLobbyEntryMarker).toHaveBeenCalledWith(examId);
        expect(mockRouterReplace).not.toHaveBeenCalled();
        expect(mockStartExamSession).not.toHaveBeenCalled();

        restoreLocation();
    });

    it('does not redirect on StrictMode double invoke after the lobby marker is consumed', async () => {
        const examId = '11111111-1111-1111-1111-111111111111';
        const restoreLocation = mockAttemptLocation(examId);
        const wrapper = ({ children }: { children: ReactNode }) => (
            <StrictMode>{children}</StrictMode>
        );

        mockReadStoredExamSession.mockReturnValue(null);
        mockReadStoredLobbyEntryMarker.mockReturnValueOnce(true).mockReturnValue(false);

        const { result } = renderHook(
            () =>
                useExamSession({
                    examId,
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
                    isSessionStartBlocked: true,
                }),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.isInitializingSession).toBe(false);
        });

        expect(mockClearStoredLobbyEntryMarker).toHaveBeenCalledTimes(1);
        expect(mockRouterReplace).not.toHaveBeenCalled();

        restoreLocation();
    });
});
