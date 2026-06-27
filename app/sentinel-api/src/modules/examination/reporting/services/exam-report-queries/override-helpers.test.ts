import { describe, expect, it } from 'vitest';
import type { StudentExamAccessOverride } from '../../../student-overrides/student-overrides.dto';
import { compareOverrideRecency, buildOverrideRecencyMaps } from './override-helpers';

describe('compareOverrideRecency', () => {
    it('sorts overrides in descending order of recency based on availableUntil', () => {
        const oldOverride: StudentExamAccessOverride = {
            id: '1',
            studentId: 'std1',
            examId: 'ex1',
            overrideType: 'MAKEUP',
            allowedAttempts: 1,
            usedAttempts: 0,
            usedAttemptIds: [],
            availableUntil: '2020-01-01T00:00:00Z',
            createdAt: '2020-01-01T00:00:00Z',
            updatedAt: '2020-01-01T00:00:00Z',
        };
        const newOverride: StudentExamAccessOverride = {
            ...oldOverride,
            id: '2',
            availableUntil: '2026-01-01T00:00:00Z',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
        };

        const result = compareOverrideRecency(oldOverride, newOverride);
        expect(result).toBeGreaterThan(0); // right is more recent
    });
});

describe('buildOverrideRecencyMaps', () => {
    it('builds maps correctly', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const overrides: StudentExamAccessOverride[] = [
            {
                id: '1',
                studentId: 'std1',
                examId: 'ex1',
                overrideType: 'RETAKE',
                allowedAttempts: 2,
                usedAttempts: 1,
                usedAttemptIds: ['attempt-1'],
                availableUntil: futureDate.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        const { overrideAttemptKindMap, activeOverrideMap } = buildOverrideRecencyMaps(overrides);
        
        expect(overrideAttemptKindMap.get('attempt-1')).toBe('retake');
        expect(activeOverrideMap.get('std1')).toBe('RETAKE');
    });
});
