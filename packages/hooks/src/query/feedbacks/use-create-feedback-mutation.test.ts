import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateFeedbackMutation } from './use-create-feedback-mutation';

const { mockInvalidateQueries, mockCreateFeedback, mockFeedbackQueryKeys } = vi.hoisted(() => ({
    mockInvalidateQueries: vi.fn(),
    mockCreateFeedback: vi.fn(),
    mockFeedbackQueryKeys: {
        all: ['feedbacks'],
    },
}));

vi.mock('@tanstack/react-query', () => ({
    useMutation: vi.fn((options: any) => ({
        mutate: options.mutationFn,
        mutateAsync: options.mutationFn,
        onSuccess: options.onSuccess,
    })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
}));

vi.mock('@sentinel/shared/constants', () => ({
    FEEDBACK_QUERY_KEYS: mockFeedbackQueryKeys,
}));

vi.mock('../../api-provider', () => ({
    useApi: () => ({ mockClient: true }),
}));

vi.mock('@sentinel/services', () => ({
    createFeedback: (...args: unknown[]) => mockCreateFeedback(...args),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useCreateFeedbackMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits feedback and invalidates feedback queries', async () => {
        const payload = {
            attemptId: '11111111-1111-4111-8111-111111111111',
            rating: 5,
        };

        const mutation = useCreateFeedbackMutation();
        await (mutation as any).mutate(payload);
        await (mutation as any).onSuccess({ feedbackId: 'abc' }, payload, undefined);

        expect(mockCreateFeedback).toHaveBeenCalledWith({ mockClient: true }, payload);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: mockFeedbackQueryKeys.all,
        });
    });
});
