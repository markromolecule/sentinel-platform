import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateExamSectionAssignmentsBatchMutation } from './use-create-exam-section-assignments-batch-mutation';
import { createExamSectionAssignmentsBatch } from '@sentinel/services';

const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        const mutateAsync = async (variables: any) => {
            try {
                let data: any = [];
                if (options.mutationFn) {
                    data = await options.mutationFn(variables);
                }
                if (options.onSuccess) {
                    await options.onSuccess(data, variables, null);
                }
                return data;
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
    createExamSectionAssignmentsBatch: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useCreateExamSectionAssignmentsBatchMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls createExamSectionAssignmentsBatch and invalidates queries', async () => {
        const variables = {
            examId: 'exam-123',
            payload: {
                assignments: [
                    {
                        sectionId: 'sec-1',
                        classGroupId: 'class-1',
                        roomId: 'room-1',
                        instructorId: 'inst-1',
                    },
                ],
            },
        };

        vi.mocked(createExamSectionAssignmentsBatch).mockResolvedValue([{ id: 'assign-1' }] as any);

        const mutation = useCreateExamSectionAssignmentsBatchMutation();
        await (mutation as any).mutateAsync(variables);

        expect(createExamSectionAssignmentsBatch).toHaveBeenCalledWith(
            { mockClient: true },
            variables,
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams', 'exam-123', 'section-assignments'],
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams'],
        });
    });
});
