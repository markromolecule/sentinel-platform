import { describe, expect, it } from 'vitest';
import { shouldShowExamDetailsLoading } from './mobile-exam-details-state';

describe('mobile exam details state', () => {
    it.each([
        [{ isAuthLoading: true, isPending: false, isFetching: false, hasRawExam: false }, true],
        [{ isAuthLoading: false, isPending: true, isFetching: false, hasRawExam: false }, true],
        [{ isAuthLoading: false, isPending: false, isFetching: true, hasRawExam: false }, true],
        [{ isAuthLoading: false, isPending: false, isFetching: true, hasRawExam: true }, false],
        [{ isAuthLoading: false, isPending: false, isFetching: false, hasRawExam: false }, false],
    ] as const)('returns %s for query state %#', (state, expected) => {
        expect(shouldShowExamDetailsLoading(state)).toBe(expected);
    });
});
