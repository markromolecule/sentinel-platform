export const FEEDBACK_QUERY_KEYS = {
    all: ['feedbacks'] as const,
    lists: () => [...FEEDBACK_QUERY_KEYS.all, 'list'] as const,
    list: (params?: unknown) => [...FEEDBACK_QUERY_KEYS.lists(), params] as const,
    details: () => [...FEEDBACK_QUERY_KEYS.all, 'detail'] as const,
    detail: (feedbackId: string) => [...FEEDBACK_QUERY_KEYS.details(), feedbackId] as const,
} as const;
