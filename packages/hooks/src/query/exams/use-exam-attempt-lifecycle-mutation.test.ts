import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    useCloseExamAttemptMutation,
    useGrantMakeupExamWindowMutation,
    useLockExamAttemptMutation,
} from './use-exam-attempt-lifecycle-mutation';
import {
    closeExamAttemptLifecycle,
    grantMakeupExamWindowLifecycle,
    lockExamAttemptLifecycle,
} from '@sentinel/services';

const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        const mutateAsync = async (variables: any) => {
            try {
                let result = undefined;
                if (options.mutationFn) {
                    result = await options.mutationFn(variables);
                }
                if (options.onSuccess) {
                    await options.onSuccess(result, variables, null);
                }
            } catch (error) {
                if (options.onError) {
                    options.onError(error, variables, null);
                }
                throw error;
            }
        };
        return { mutateAsync };
    }),
}));

vi.mock('@sentinel/services', () => ({
    closeExamAttemptLifecycle: vi.fn(),
    grantMakeupExamWindowLifecycle: vi.fn(),
    lockExamAttemptLifecycle: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useExamAttemptLifecycleMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the lock lifecycle service and invalidates monitoring queries', async () => {
        const mutation = useLockExamAttemptMutation();
        const payload = {
            id: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'MANUAL_MONITORING_LOCK',
        };

        await (mutation as any).mutateAsync(payload);

        expect(lockExamAttemptLifecycle).toHaveBeenCalledWith({ mockClient: true }, payload);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams', 'exam-1', 'monitoring'],
        });
    });

    it('calls the close lifecycle service for attempt-scoped paths', async () => {
        const mutation = useCloseExamAttemptMutation();
        const payload = {
            id: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'MANUAL_MONITORING_CLOSE',
        };

        await (mutation as any).mutateAsync(payload);

        expect(closeExamAttemptLifecycle).toHaveBeenCalledWith({ mockClient: true }, payload);
    });

    it('surfaces service errors for invalid lifecycle payloads', async () => {
        vi.mocked(grantMakeupExamWindowLifecycle).mockRejectedValueOnce(
            new Error('Invalid window'),
        );

        const mutation = useGrantMakeupExamWindowMutation();

        await expect(
            (mutation as any).mutateAsync({
                id: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00.000Z',
                availableUntil: '2026-07-04T09:00:00.000Z',
            }),
        ).rejects.toThrow('Invalid window');
    });

    it('invalidates report and remediation queries on successful grant', async () => {
        vi.mocked(grantMakeupExamWindowLifecycle).mockResolvedValueOnce({
            remediationExam: {
                examId: 'remediation-exam-123',
                title: 'Math Cloned',
            },
            remediationSchedule: {
                remediationId: 'remediation-id-123',
            },
            override: null,
            latestEvent: null,
        } as any);

        const mutation = useGrantMakeupExamWindowMutation();
        await (mutation as any).mutateAsync({
            id: 'exam-1',
            studentId: 'student-1',
            availableFrom: '2026-07-04T08:00:00.000Z',
            availableUntil: '2026-07-04T10:00:00.000Z',
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams', 'exam-1', 'report'],
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams', 'remediation-exam-123'],
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams', 'remediation-exam-123', 'configuration'],
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams'],
        });
    });
});
