import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamAttemptRuntimeFooter } from './exam-attempt-runtime-footer';

vi.mock('@sentinel/ui', () => ({
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    Button: ({ children, onClick, ...props }: ComponentProps<'button'>) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

describe('ExamAttemptRuntimeFooter', () => {
    afterEach(cleanup);

    it('keeps the current question count visible and moves between questions', () => {
        const onMove = vi.fn();

        render(
            <ExamAttemptRuntimeFooter
                progress={40}
                isFlagged={false}
                onMove={onMove}
                currentQuestionIndex={1}
                totalQuestions={5}
                isLastQuestion={false}
                onSubmit={vi.fn()}
            />,
        );

        expect(screen.getByText('Question 2 of 5')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));

        expect(onMove).toHaveBeenNthCalledWith(1, 'previous');
        expect(onMove).toHaveBeenNthCalledWith(2, 'next');
    });
});
