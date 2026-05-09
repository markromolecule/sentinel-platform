import { describe, expect, it } from 'vitest';
import { getExamAssignmentAccessStatuses } from './exam-access';

describe('getExamAssignmentAccessStatuses', () => {
    it('only allows accepted assignees to inherit instructor exam access', () => {
        expect(getExamAssignmentAccessStatuses()).toEqual(['ACCEPTED']);
        expect(getExamAssignmentAccessStatuses()).not.toContain('PENDING');
        expect(getExamAssignmentAccessStatuses()).not.toContain('DECLINED');
    });
});
