import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInstructorLobby } from './use-instructor-lobby';

const {
    mockUseApi,
    mockGetExamLobbyWaitingList,
    mockUpdateExamLobbyAdmissions,
    mockToastSuccess,
    mockToastError,
} = vi.hoisted(() => ({
    mockUseApi: vi.fn(),
    mockGetExamLobbyWaitingList: vi.fn(),
    mockUpdateExamLobbyAdmissions: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockUseApi(),
}));

vi.mock('@sentinel/services', () => ({
    getExamLobbyWaitingList: (...args: unknown[]) => mockGetExamLobbyWaitingList(...args),
    updateExamLobbyAdmissions: (...args: unknown[]) => mockUpdateExamLobbyAdmissions(...args),
}));

vi.mock('sonner', () => ({
    toast: {
        success: mockToastSuccess,
        error: mockToastError,
    },
}));

describe('useInstructorLobby', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseApi.mockReturnValue({ api: true });
        mockGetExamLobbyWaitingList.mockResolvedValue([
            {
                admissionId: 'admission-1',
                studentId: 'student-1',
                studentName: 'Pat Student',
                studentNumber: '2026-001',
                status: 'WAITING',
                checkedInAt: null,
                decidedAt: null,
                hasActiveAttempt: false,
                attemptStatus: null,
                reconnectCount: 1,
            },
        ]);
    });

    it('optimistically updates admissions before reconciling with the server list', async () => {
        let resolveMutation: ((value: { updatedCount: number }) => void) | undefined;

        mockUpdateExamLobbyAdmissions.mockImplementation(
            () =>
                new Promise<{ updatedCount: number }>((resolve) => {
                    resolveMutation = resolve;
                }),
        );

        const { result } = renderHook(() => useInstructorLobby('exam-1'));

        await waitFor(() => {
            expect(result.current.lobbyAdmissions).toHaveLength(1);
        });

        let pendingUpdate: Promise<void> | undefined;

        act(() => {
            pendingUpdate = result.current.handleUpdateLobbyAdmissions(['student-1'], 'APPROVED');
        });

        await waitFor(() => {
            expect(result.current.lobbyAdmissions[0]?.status).toBe('APPROVED');
        });

        resolveMutation?.({ updatedCount: 1 });
        await act(async () => {
            await pendingUpdate;
        });

        expect(mockToastSuccess).toHaveBeenCalled();
        expect(mockGetExamLobbyWaitingList).toHaveBeenCalledTimes(2);
    });
});
