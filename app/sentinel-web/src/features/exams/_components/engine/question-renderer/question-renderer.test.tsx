import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FillBlankQuestion } from './_components/fill-blank-question';
import { MatchingQuestion } from './_components/matching-question';
import { EnumerationQuestion } from './_components/enumeration-question';
import type { ExamQuestion } from '@sentinel/shared';

vi.mock('@sentinel/ui', () => ({
    Input: (props: any) => <input {...props} data-testid="mock-input" />,
}));

describe('Question Renderers', () => {
    afterEach(() => {
        cleanup();
    });

    describe('FillBlankQuestion', () => {
        const question: ExamQuestion = {
            id: 'q-fb',
            examId: 'exam-1',
            type: 'FILL_BLANK',
            points: 5,
            orderIndex: 0,
            tags: [],
            content: {
                prompt: 'Roses are [blank1], violets are [blank2].',
                blanks: ['red', 'blue'],
            },
        };

        it('renders neutral placeholders when showCorrectAnswer is false', () => {
            render(
                <FillBlankQuestion
                    question={question}
                    value={['', '']}
                    onChange={vi.fn()}
                    showCorrectAnswer={false}
                />
            );

            const inputs = screen.getAllByTestId('mock-input');
            expect(inputs).toHaveLength(2);
            expect(inputs[0].getAttribute('placeholder')).toBe('Response 1');
            expect(inputs[1].getAttribute('placeholder')).toBe('Response 2');
            expect(screen.queryByText(/Answer key:/)).toBeNull();
        });

        it('shows answer key and correct placeholder when showCorrectAnswer is true', () => {
            render(
                <FillBlankQuestion
                    question={question}
                    value={['', '']}
                    onChange={vi.fn()}
                    showCorrectAnswer={true}
                />
            );

            const inputs = screen.getAllByTestId('mock-input');
            expect(inputs).toHaveLength(2);
            expect(inputs[0].getAttribute('placeholder')).toBe('red');
            expect(inputs[1].getAttribute('placeholder')).toBe('blue');
            expect(screen.getAllByText(/Answer key:/)).toHaveLength(2);
        });
    });

    describe('MatchingQuestion', () => {
        const question: ExamQuestion = {
            id: 'q-m',
            examId: 'exam-1',
            type: 'MATCHING',
            points: 5,
            orderIndex: 0,
            tags: [],
            content: {
                prompt: 'Match country to capital',
                pairs: [
                    { left: 'France', right: 'Paris' },
                    { left: 'Japan', right: 'Tokyo' },
                ],
            },
        };

        it('renders neutral placeholders when showCorrectAnswer is false', () => {
            render(
                <MatchingQuestion
                    question={question}
                    value={{}}
                    onChange={vi.fn()}
                    showCorrectAnswer={false}
                />
            );

            const inputs = screen.getAllByTestId('mock-input');
            expect(inputs).toHaveLength(2);
            expect(inputs[0].getAttribute('placeholder')).toBe('Type the matching value...');
            expect(inputs[1].getAttribute('placeholder')).toBe('Type the matching value...');
            expect(screen.queryByText(/Correct match:/)).toBeNull();
        });

        it('shows correct matches and placeholder correct values when showCorrectAnswer is true', () => {
            render(
                <MatchingQuestion
                    question={question}
                    value={{}}
                    onChange={vi.fn()}
                    showCorrectAnswer={true}
                />
            );

            const inputs = screen.getAllByTestId('mock-input');
            expect(inputs).toHaveLength(2);
            expect(inputs[0].getAttribute('placeholder')).toBe('Paris');
            expect(inputs[1].getAttribute('placeholder')).toBe('Tokyo');
            expect(screen.getAllByText(/Correct match:/)).toHaveLength(2);
        });
    });

    describe('EnumerationQuestion', () => {
        const question: ExamQuestion = {
            id: 'q-e',
            examId: 'exam-1',
            type: 'ENUMERATION',
            points: 5,
            orderIndex: 0,
            tags: [],
            content: {
                prompt: 'Primary colors',
                acceptedAnswers: ['red', 'green', 'blue'],
            },
        };

        it('renders correct number of fields and hides accepted answers when showCorrectAnswer is false', () => {
            render(
                <EnumerationQuestion
                    question={question}
                    value={['', '', '']}
                    onChange={vi.fn()}
                    showCorrectAnswer={false}
                />
            );

            const inputs = screen.getAllByTestId('mock-input');
            expect(inputs).toHaveLength(3);
            expect(screen.queryByText(/Accepted answer:/)).toBeNull();
        });

        it('shows accepted answers when showCorrectAnswer is true', () => {
            render(
                <EnumerationQuestion
                    question={question}
                    value={['', '', '']}
                    onChange={vi.fn()}
                    showCorrectAnswer={true}
                />
            );

            const inputs = screen.getAllByTestId('mock-input');
            expect(inputs).toHaveLength(3);
            expect(screen.getAllByText(/Accepted answer:/)).toHaveLength(3);
        });
    });
});
