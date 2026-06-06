import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteUsersMutation } from './use-delete-users-mutation';
import { deleteUsers } from '@sentinel/services';
import { STUDENT_WHITELIST_QUERY_KEYS, USER_QUERY_KEYS } from '@sentinel/shared/constants';

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
                    await options.onSuccess(undefined, variables, null);
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
    deleteUsers: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useDeleteUsersMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls deleteUsers and invalidates cache on success', async () => {
        const ids = ['user-uuid-1', 'user-uuid-2'];

        const mutation = useDeleteUsersMutation();
        await (mutation as any).mutateAsync(ids);

        expect(deleteUsers).toHaveBeenCalledWith({ mockClient: true }, ids);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: USER_QUERY_KEYS.all,
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: STUDENT_WHITELIST_QUERY_KEYS.all,
        });
    });
});
