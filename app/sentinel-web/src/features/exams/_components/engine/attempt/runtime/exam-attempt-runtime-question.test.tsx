import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamAttemptRuntimeQuestion } from './exam-attempt-runtime-question';

vi.mock('@sentinel/ui', () => ({
    Button: ({ children, className, onClick, ...props }: ComponentProps<'button'>) => (
        <button className={className} onClick={onClick} {...props}>
            {children}
        </button>
    ),
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('@/features/exams/_components/engine', () => ({
    ExamQuestionRenderer: () => <div data-testid="question-renderer" />,
}));

describe('ExamAttemptRuntimeQuestion', () => {
    afterEach(cleanup);

    it('keeps review and cross-out actions in a compact horizontal grid', () => {
        const onToggleFlag = vi.fn();
        const onToggleCrossOutMode = vi.fn();

        render(
            <ExamAttemptRuntimeQuestion
                currentQuestion={{ id: 'question-1' } as never}
                selectedAnswer={null}
                onAnswerChange={vi.fn()}
                isFlagged={false}
                onToggleFlag={onToggleFlag}
                crossOutEnabled={false}
                onToggleCrossOutMode={onToggleCrossOutMode}
                crossedOutOptions={[]}
                onToggleOptionCrossOut={vi.fn()}
            />,
        );

        expect(screen.getByTestId('question-runtime-actions').className).toContain('grid-cols-2');

        const reviewButton = screen.getByRole('button', { name: 'Mark for review' });
        const crossOutButton = screen.getByRole('button', { name: 'Enable cross-out' });

        expect(reviewButton.className).toContain('min-h-11');
        expect(crossOutButton.className).toContain('min-h-11');

        fireEvent.click(reviewButton);
        fireEvent.click(crossOutButton);

        expect(onToggleFlag).toHaveBeenCalledOnce();
        expect(onToggleCrossOutMode).toHaveBeenCalledOnce();
    });
});
