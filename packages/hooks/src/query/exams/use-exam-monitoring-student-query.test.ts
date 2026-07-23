import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getExamMonitoringStudentDetail } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useExamMonitoringStudentQuery } from './use-exam-monitoring-student-query';

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => {
        if (options.queryFn) {
            options.queryFn();
        }

        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
            refetchInterval: options.refetchInterval,
            refetchIntervalInBackground: options.refetchIntervalInBackground,
        };
    }),
}));

vi.mock('@sentinel/services', () => ({
    getExamMonitoringStudentDetail: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useExamMonitoringStudentQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses an exam/student-scoped cache key and polls student monitoring every 5 seconds', () => {
        const query = useExamMonitoringStudentQuery('exam-1', 'student-1') as any;

        expect(getExamMonitoringStudentDetail).toHaveBeenCalledWith(
            { mockClient: true },
            'exam-1',
            'student-1',
        );
        expect(query.queryKey).toEqual(EXAM_QUERY_KEYS.monitoringStudent('exam-1', 'student-1'));
        expect(query.enabled).toBe(true);
        expect(query.refetchInterval).toBe(5000);
        expect(query.refetchIntervalInBackground).toBe(true);
    });
});
