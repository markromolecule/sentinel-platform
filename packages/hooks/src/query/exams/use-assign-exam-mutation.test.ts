import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssignExamMutation } from './use-assign-exam-mutation';
import { assignExam } from '@sentinel/services';

const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        const mutateAsync = async (variables: any) => {
            try {
                if (options.mutationFn) {
                    await options.mutationFn(variables);
                }
                if (options.onSuccess) {
                    await options.onSuccess(
                        { id: 'assignment-id', status: 'PENDING' },
                        variables,
                        null,
                    );
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
    assignExam: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useAssignExamMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls assignExam and invalidates exam-assignments queries', async () => {
        const payload = {
            examId: 'exam-uuid-1111-2222',
            assigneeId: 'instructor-uuid-3333-4444',
        };

        const mutation = useAssignExamMutation();
        await (mutation as any).mutateAsync(payload);

        expect(assignExam).toHaveBeenCalledWith({ mockClient: true }, payload);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exam-assignments'],
        });
    });
});
