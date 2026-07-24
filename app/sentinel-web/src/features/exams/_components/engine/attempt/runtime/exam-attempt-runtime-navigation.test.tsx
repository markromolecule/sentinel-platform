import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamAttemptRuntimeNavigation } from './exam-attempt-runtime-navigation';

vi.mock('@sentinel/ui', () => ({
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

const questions = ['question-1', 'question-2', 'question-3'].map((id) => ({ id })) as never;

describe('ExamAttemptRuntimeNavigation', () => {
    afterEach(cleanup);

    it('selects the exact question number and preserves navigation state markers', () => {
        const onQuestionSelect = vi.fn();

        render(
            <ExamAttemptRuntimeNavigation
                questions={questions}
                currentQuestionIndex={1}
                onQuestionSelect={onQuestionSelect}
                answeredQuestionIds={['question-1']}
                reviewQuestionIds={['question-3']}
            />,
        );

        const firstQuestion = screen.getByRole('button', { name: 'Question 1' });
        const middleQuestion = screen.getByRole('button', { name: 'Question 2' });
        const lastQuestion = screen.getByRole('button', { name: 'Question 3' });

        expect(firstQuestion.className).toContain('h-12');
        expect(firstQuestion.className).toContain('w-12');
        expect(middleQuestion.getAttribute('aria-current')).toBe('step');
        expect(firstQuestion.querySelector('span')?.className).toContain('pointer-events-none');
        expect(lastQuestion.querySelector('svg')?.getAttribute('class')).toContain(
            'pointer-events-none',
        );

        fireEvent.click(firstQuestion);
        fireEvent.click(middleQuestion);
        fireEvent.click(lastQuestion);

        expect(onQuestionSelect).toHaveBeenNthCalledWith(1, 0);
        expect(onQuestionSelect).toHaveBeenNthCalledWith(2, 1);
        expect(onQuestionSelect).toHaveBeenNthCalledWith(3, 2);
    });
});
