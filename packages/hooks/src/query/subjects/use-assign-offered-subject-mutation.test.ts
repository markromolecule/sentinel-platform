import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssignOfferedSubjectMutation } from './use-assign-offered-subject-mutation';
import { assignOfferedSubject } from '@sentinel/services';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        const mutateAsync = async (variables: any) => {
            try {
                let response = {};
                if (options.mutationFn) {
                    response = await options.mutationFn(variables);
                }
                if (options.onSuccess) {
                    await options.onSuccess(response, variables, null);
                }
                return response;
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
    assignOfferedSubject: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useAssignOfferedSubjectMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls assignOfferedSubject and invalidates cache on success', async () => {
        const payload = {
            instructorId: 'instructor-uuid-1',
            subjectOfferingId: 'offering-uuid-1',
        };

        vi.mocked(assignOfferedSubject).mockResolvedValue({
            message: 'Assigned successfully',
            data: {
                assignedClassGroupIds: [],
                enrollmentRequestIds: [],
                classRoleIds: [],
            },
        } as any);

        const mutation = useAssignOfferedSubjectMutation();
        await (mutation as any).mutateAsync(payload);

        expect(assignOfferedSubject).toHaveBeenCalledWith({ mockClient: true }, payload);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: SUBJECT_QUERY_KEYS.all,
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: SUBJECT_OFFERING_QUERY_KEYS.all,
        });
    });
});
