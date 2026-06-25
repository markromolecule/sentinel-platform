'use client';

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamLobbyPage from './page';

const {
    mockLobbyCountQuery,
    mockLobbyPresence,
    mockStudentExamData,
    mockLobbyState,
} = vi.hoisted(() => ({
    mockLobbyCountQuery: vi.fn(),
    mockLobbyPresence: vi.fn(),
    mockStudentExamData: vi.fn(),
    mockLobbyState: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useExamLobbyCountQuery: (examId: string) => mockLobbyCountQuery(examId),
}));

vi.mock('../_components/student-exam-loading-state', () => ({
    StudentExamLoadingState: () => <div>Loading...</div>,
}));

vi.mock('../_components/student-flow-shell', () => ({
    StudentFlowShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../_components/monitoring-preloader', () => ({
    MonitoringPreloader: () => null,
}));

vi.mock('../_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => mockStudentExamData(),
}));

vi.mock('../_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

vi.mock('./_hooks/use-lobby-presence', () => ({
    useLobbyPresence: (examId: string) => mockLobbyPresence(examId),
}));

vi.mock('./_hooks/use-lobby-state', () => ({
    useLobbyState: () => mockLobbyState(),
}));

describe('StudentExamLobbyPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            exam: {
                duration: 60,
                runtimeAccess: {
                    state: 'lobby_waiting',
                    reasonCode: 'LOBBY_WAITING',
                    message: 'Waiting for approval.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    reconnectAttemptsRemaining: 2,
                    totalReconnectAttempts: 3,
                },
            },
            configuration: {
                maxReconnectAttempts: 3,
            },
            mediaPipeSandbox: null,
            refetchExam: vi.fn(),
            isLoading: false,
        });
        mockLobbyState.mockReturnValue({
            countdownLabel: '00:10:00',
            hasCompletedFlow: true,
            runtimeAccess: {
                state: 'lobby_waiting',
                reasonCode: 'LOBBY_WAITING',
                message: 'Waiting for approval.',
                canStart: false,
                canResume: false,
                hasActiveAttempt: false,
                reconnectAttemptsRemaining: 2,
                totalReconnectAttempts: 3,
            },
            canEnterExam: false,
            reopenedUntil: null,
            storedSession: null,
            mediaPipeLobbyMessage: null,
            isStartingSession: false,
            isAdmissionPendingRefresh: false,
            handleEnterExam: vi.fn(),
        });
    });

    it('prefers the API lobby count when presence is higher and shows reconnect used versus remaining', () => {
        mockLobbyCountQuery.mockReturnValue({
            data: { count: 3 },
            isError: false,
        });
        mockLobbyPresence.mockReturnValue({
            presenceCount: 7,
        });

        render(<StudentExamLobbyPage />);

        expect(screen.getByText('3 students')).toBeTruthy();
        expect(screen.queryByText('7 students')).toBeNull();
        expect(screen.getByText('1 used • 2 left')).toBeTruthy();
        expect(screen.getByText('Reconnect attempts used: 1 of 3. Remaining: 2.')).toBeTruthy();
    });

    it('falls back to presence only when the API count is unavailable', () => {
        mockLobbyCountQuery.mockReturnValue({
            data: undefined,
            isError: true,
        });
        mockLobbyPresence.mockReturnValue({
            presenceCount: 4,
        });

        render(<StudentExamLobbyPage />);

        expect(screen.getByText('4 students')).toBeTruthy();
    });
});
