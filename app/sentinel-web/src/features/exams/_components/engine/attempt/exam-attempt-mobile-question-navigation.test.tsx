import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ExamAttemptMobileQuestionNavigation } from './exam-attempt-mobile-question-navigation';

describe('ExamAttemptMobileQuestionNavigation', () => {
    afterEach(cleanup);

    it('exposes an explicit horizontal touch-scroll region for question buttons', () => {
        render(
            <ExamAttemptMobileQuestionNavigation
                questionRail={<button type="button">Question 1</button>}
            />,
        );

        const navigation = screen.getByRole('navigation', { name: 'Question navigation' });

        expect(navigation.getAttribute('data-testid')).toBe('compact-question-navigation');
        expect(navigation.className).toContain('overflow-x-auto');
        expect(navigation.className).toContain('overscroll-x-contain');
        expect(navigation.className).toContain('touch-pan-x');
        expect(navigation.firstElementChild?.className).toContain('w-max');
        expect(navigation.firstElementChild?.className).toContain('min-w-full');
    });
});
