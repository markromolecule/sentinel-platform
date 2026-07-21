'use client';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentExamStageGuard } from './use-student-exam-stage-guard';

const { mockRouterReplace, mockStudentExamData, mockReadStoredStudentExamFlow } = vi.hoisted(
    () => ({
        mockRouterReplace: vi.fn(),
        mockStudentExamData: vi.fn(),
        mockReadStoredStudentExamFlow: vi.fn(),
    }),
);

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('./use-student-exam-data', () => ({
    useStudentExamData: () => mockStudentExamData(),
}));

vi.mock('../_lib/student-exam-flow', async () => {
    const actual = await vi.importActual<typeof import('../_lib/student-exam-flow')>(
        '../_lib/student-exam-flow',
    );

    return {
        ...actual,
        readStoredStudentExamFlow: () => mockReadStoredStudentExamFlow(),
    };
});

describe('useStudentExamStageGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            blockedState: { isBlocked: false, code: null },
            configuration: { lobbyAdmissionMode: 'AUTOMATIC', maxReconnectAttempts: 3 },
            mediaPipeSandbox: { enabled: false },
            exam: { status: 'published', attemptId: null, runtimeAccess: null },
            isLoading: false,
            configQueryError: false,
            isExamError: false,
        });

        mockReadStoredStudentExamFlow.mockReturnValue({
            privacyAccepted: false,
            checkupCompleted: false,
            mediaPipeActivatedAt: null,
            mediaPipeCalibrationCompletedAt: null,
            mediaPipeActivationSource: null,
            mediaPipeCalibrationProfile: null,
        });
    });

    it('triggers router replace when requested stage violates preflight state', () => {
        const { result } = renderHook(() => useStudentExamStageGuard('attempt'));

        expect(result.current.isResolving).toBe(true);
        expect(result.current.resolution.targetStage).toBe('privacy');
        expect(mockRouterReplace).toHaveBeenCalledWith('/student/exam/exam-1/privacy');
    });

    it('does not trigger router replace when requested stage matches target stage', () => {
        const { result } = renderHook(() => useStudentExamStageGuard('instruction'));

        expect(result.current.isResolving).toBe(false);
        expect(result.current.resolution.targetStage).toBe('instruction');
        expect(mockRouterReplace).not.toHaveBeenCalled();
    });
});
