import { describe, expect, it } from 'vitest';
import {
    buildStudentHistoryAttemptHref,
    buildStudentHistoryExamHref,
    buildStudentHistoryFallbackHref,
} from './student-history-routes';

describe('studentHistoryRoutes', () => {
    it('builds the canonical attempt history href', () => {
        expect(buildStudentHistoryAttemptHref('f8af70a2-d9ed-4645-91f4-e5361dae473a')).toBe(
            '/student/history/attempts/f8af70a2-d9ed-4645-91f4-e5361dae473a',
        );
    });

    it('builds the canonical exam history href', () => {
        expect(buildStudentHistoryExamHref('a66615cd-3b77-4c6f-a2c0-e614ea8be80f')).toBe(
            '/student/history/exams/a66615cd-3b77-4c6f-a2c0-e614ea8be80f',
        );
    });

    it('prefers attempt ids when both attempt and exam ids exist', () => {
        expect(
            buildStudentHistoryFallbackHref({
                attemptId: 'attempt-1',
                examId: 'exam-1',
            }),
        ).toBe('/student/history/attempts/attempt-1');
    });

    it('falls back to the exam history href when only exam id exists', () => {
        expect(
            buildStudentHistoryFallbackHref({
                attemptId: null,
                examId: 'exam-1',
            }),
        ).toBe('/student/history/exams/exam-1');
    });

    it('falls back to the student history index when no ids exist', () => {
        expect(
            buildStudentHistoryFallbackHref({
                attemptId: null,
                examId: null,
            }),
        ).toBe('/student/history');
    });
});
