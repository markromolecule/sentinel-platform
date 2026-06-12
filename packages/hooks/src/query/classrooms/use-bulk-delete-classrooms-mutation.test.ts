import { describe, expect, it, vi } from 'vitest';
import { useBulkDeleteClassroomsMutation } from './use-bulk-delete-classrooms-mutation';
import { bulkDeleteClassrooms } from '@sentinel/services';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';

const mockInvalidateQueries = vi.fn();
const mockRemoveQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useMutation: vi.fn((options: any) => ({
        mutate: options.mutationFn,
        mutateAsync: options.mutationFn,
        onSuccess: options.onSuccess,
    })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
        removeQueries: mockRemoveQueries,
    })),
}));

vi.mock('@sentinel/services', () => ({
    bulkDeleteClassrooms: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useBulkDeleteClassroomsMutation', () => {
    it('calls bulkDeleteClassrooms with the provided classroom IDs', async () => {
        const mutation = useBulkDeleteClassroomsMutation();
        await (mutation as any).mutate(['id-1', 'id-2']);

        expect(bulkDeleteClassrooms).toHaveBeenCalledWith({ mockClient: true }, ['id-1', 'id-2']);
    });

    it('invalidates queries and removes detailed cache on success', async () => {
        const mutation = useBulkDeleteClassroomsMutation();
        await (mutation as any).onSuccess(undefined, ['id-1', 'id-2'], undefined);

        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: CLASSROOM_QUERY_KEYS.all });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['instructor-students'] });
        expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: CLASSROOM_QUERY_KEYS.details('id-1') });
        expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: CLASSROOM_QUERY_KEYS.details('id-2') });
    });
});
