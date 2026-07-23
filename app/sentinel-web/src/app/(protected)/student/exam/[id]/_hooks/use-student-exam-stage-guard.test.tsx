import { cleanup, renderHook } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentExamStageGuard } from './use-student-exam-stage-guard';

const {
    mockRouterReplace,
    mockUseStudentExamData,
    mockReadStoredExamSession,
    mockReadStoredLobbyEntry,
    mockConsumeStoredLobbyEntry,
    mockResolveStudentExamStage,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockUseStudentExamData: vi.fn(),
    mockReadStoredExamSession: vi.fn(),
    mockReadStoredLobbyEntry: vi.fn(),
    mockConsumeStoredLobbyEntry: vi.fn(),
    mockResolveStudentExamStage: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('./use-student-exam-data', () => ({
    useStudentExamData: () => mockUseStudentExamData(),
}));

vi.mock('../_lib/exam-session-storage', () => ({
    clearStoredExamSession: vi.fn(),
    readStoredExamSession: (examId: string) => mockReadStoredExamSession(examId),
    readStoredLobbyEntry: (examId: string) => mockReadStoredLobbyEntry(examId),
    consumeStoredLobbyEntry: (examId: string) => mockConsumeStoredLobbyEntry(examId),
}));

vi.mock('../_lib/student-exam-flow', () => ({
    buildStudentExamHref: (examId: string, stage: string) => `/student/exam/${examId}/${stage}`,
    readStoredStudentExamFlow: () => ({
        privacyAccepted: true,
        checkupCompleted: true,
    }),
    resolveStoredStudentExamMediaPipeActivation: () => ({
        status: 'ready',
    }),
    resolveStudentExamAdmissionState: () => null,
    resolveStudentExamMediaPipeSandbox: () => ({
        enabled: false,
        captureDuringCheckup: false,
    }),
    resolveStudentExamStage: (...args: any[]) => mockResolveStudentExamStage(...args),
}));

describe('useStudentExamStageGuard', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();

        mockUseStudentExamData.mockReturnValue({
            examId: 'test-exam-id',
            exam: {
                id: 'test-exam-id',
                title: 'Test Exam',
                status: 'available',
                runtimeAccess: {
                    canStart: true,
                    canResume: false,
                    hasActiveAttempt: false,
                },
            },
            configuration: {
                lobbyAdmissionMode: 'AUTOMATIC',
            },
            blockedState: {
                code: null,
            },
            isLoading: false,
        });

        mockReadStoredExamSession.mockReturnValue(null);
        mockReadStoredLobbyEntry.mockReturnValue(null);
        mockConsumeStoredLobbyEntry.mockReturnValue(null);

        mockResolveStudentExamStage.mockReturnValue({
            targetStage: 'lobby',
            reasonCode: 'TEST',
            shouldRedirect: false,
        });
    });

    it('resolves stages and executes redirects correctly', () => {
        mockResolveStudentExamStage.mockReturnValue({
            targetStage: 'lobby',
            reasonCode: 'TEST_REDIRECT',
            shouldRedirect: true,
        });

        renderHook(() => useStudentExamStageGuard('instruction'));

        expect(mockRouterReplace).toHaveBeenCalledWith(
            '/student/exam/test-exam-id/lobby',
        );
    });

    it('consumes fresh lobby entry marker on attempt page', () => {
        mockReadStoredLobbyEntry.mockReturnValue({
            token: 'fresh-token',
            version: 1,
            examId: 'test-exam-id',
            createdAt: new Date().toISOString(),
        });

        mockResolveStudentExamStage.mockReturnValue({
            targetStage: 'attempt',
            reasonCode: 'ATTEMPT_ACTIVE',
            shouldRedirect: false,
        });

        renderHook(() => useStudentExamStageGuard('attempt'));

        expect(mockConsumeStoredLobbyEntry).toHaveBeenCalledWith('test-exam-id');
    });

    it('is StrictMode-safe and accepts recently consumed token in-memory', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <StrictMode>{children}</StrictMode>
        );

        mockReadStoredLobbyEntry.mockReturnValueOnce({
            token: 'strict-token',
            version: 1,
            examId: 'test-exam-id',
            createdAt: new Date().toISOString(),
        }).mockReturnValue({
            token: 'strict-token',
            version: 1,
            examId: 'test-exam-id',
            createdAt: new Date().toISOString(),
            consumedAt: new Date().toISOString(),
        });

        mockResolveStudentExamStage.mockReturnValue({
            targetStage: 'attempt',
            reasonCode: 'ATTEMPT_ACTIVE',
            shouldRedirect: false,
        });

        renderHook(() => useStudentExamStageGuard('attempt'), { wrapper });

        // First mount/render consumes the entry.
        // Second mount reads the consumed token, but allows it via in-memory set.
        expect(mockConsumeStoredLobbyEntry).toHaveBeenCalledTimes(1);
        expect(mockRouterReplace).not.toHaveBeenCalled();
    });
});
