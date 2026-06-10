import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteNotificationsMutation } from './use-delete-notifications-mutation';
import { deleteNotifications } from '@sentinel/services';

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
                        { message: 'Notifications deleted successfully', count: variables.length },
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
    deleteNotifications: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useDeleteNotificationsMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls deleteNotifications and invalidates the provided query key', async () => {
        const queryKey = ['notifications', 'support-header'];
        const ids = ['11111111-1111-1111-1111-111111111111'];

        const mutation = useDeleteNotificationsMutation({ queryKey });
        await (mutation as any).mutateAsync(ids);

        expect(deleteNotifications).toHaveBeenCalledWith({ mockClient: true }, ids);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
});
