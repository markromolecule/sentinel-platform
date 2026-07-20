export const LIVE_INSPECTION_QUERY_KEYS = {
    all: ['exams', 'live-inspection'] as const,
    status: (examId: string, leaseId?: string, attemptId?: string) =>
        [
            ...LIVE_INSPECTION_QUERY_KEYS.all,
            examId,
            'status',
            leaseId ?? null,
            attemptId ?? null,
        ] as const,
};
