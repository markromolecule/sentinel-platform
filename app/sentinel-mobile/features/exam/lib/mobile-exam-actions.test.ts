import { describe, expect, it } from 'vitest';
import {
    getMobileExamAction,
    getMobileExamActionLabel,
    getMobileExamRoute,
    isReadOnlyMobileExamStatus,
} from './mobile-exam-actions';
import type { MobileExamDisplay } from './mobile-exam-adapter';

describe('mobile exam actions', () => {
    it.each([
        ['available', 'open', 'Open Exam', '/exam/exam-1/instruction'],
        ['upcoming', 'upcoming', 'Upcoming', '/exam/exam-1/instruction'],
        ['turned_in', 'view', 'View', '/exam/exam-1'],
        ['past_due', 'view', 'View', '/exam/exam-1'],
        ['completed', 'view', 'View', '/exam/exam-1'],
    ] as const)(
        'maps %s exams to the expected action contract',
        (status, action, label, route) => {
            expect(getMobileExamAction(status)).toBe(action);
            expect(getMobileExamActionLabel(status)).toBe(label);
            expect(
                getMobileExamRoute({
                    id: 'exam-1',
                    status,
                } as Pick<MobileExamDisplay, 'id' | 'status'>),
            ).toBe(route);
        },
    );

    it('treats only completed, turned-in, and past-due statuses as read-only', () => {
        expect(isReadOnlyMobileExamStatus('available')).toBe(false);
        expect(isReadOnlyMobileExamStatus('upcoming')).toBe(false);
        expect(isReadOnlyMobileExamStatus('turned_in')).toBe(true);
        expect(isReadOnlyMobileExamStatus('past_due')).toBe(true);
        expect(isReadOnlyMobileExamStatus('completed')).toBe(true);
    });
});
