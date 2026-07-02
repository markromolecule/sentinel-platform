import { describe, expect, it } from 'vitest';
import { buildCoreExamAssignHref, buildCoreExamLogsHref } from './exam-management-routes';

describe('exam-management-routes', () => {
    it('builds the canonical core exam logs route', () => {
        expect(buildCoreExamLogsHref('11111111-1111-1111-1111-111111111111')).toBe(
            '/exams/11111111-1111-1111-1111-111111111111/logs',
        );
    });

    it('builds the canonical core exam assignment route', () => {
        expect(buildCoreExamAssignHref('22222222-2222-2222-2222-222222222222')).toBe(
            '/exams/22222222-2222-2222-2222-222222222222/assign',
        );
    });
});
