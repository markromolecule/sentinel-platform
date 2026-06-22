import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBulkUnenrollInstructorSubjectsMutation } from './use-bulk-unenroll-instructor-subjects-mutation';
import { unenrollInstructorSubject } from '@sentinel/services';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';

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
    unenrollInstructorSubject: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useBulkUnenrollInstructorSubjectsMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls unenrollInstructorSubject in parallel and invalidates cache on success', async () => {
        const payload = [
            { id: 'offering-1', status: 'APPROVED', classGroupIds: ['sec-1'] },
            { id: 'offering-2', status: 'PENDING', classGroupIds: [] },
        ];

        const mutation = useBulkUnenrollInstructorSubjectsMutation();
        await (mutation as any).mutateAsync(payload);

        expect(unenrollInstructorSubject).toHaveBeenCalledWith(
            { mockClient: true },
            'offering-1',
            'APPROVED',
            ['sec-1'],
        );
        expect(unenrollInstructorSubject).toHaveBeenCalledWith(
            { mockClient: true },
            'offering-2',
            'PENDING',
            [],
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: SUBJECT_QUERY_KEYS.all,
        });
    });
});
