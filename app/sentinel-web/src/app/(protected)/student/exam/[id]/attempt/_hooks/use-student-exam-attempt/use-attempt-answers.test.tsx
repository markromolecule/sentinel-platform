import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAttemptAnswers } from './use-attempt-answers';

describe('useAttemptAnswers', () => {
    it('does not count an empty string answer as answered', () => {
        const { result } = renderHook(() => useAttemptAnswers());

        act(() => {
            result.current.handleAnswerChange('question-1', '');
        });

        expect(result.current.answeredCount).toBe(0);
        expect(result.current.answeredQuestionIds).toEqual([]);
    });

    it('counts a non-empty answer as answered', () => {
        const { result } = renderHook(() => useAttemptAnswers());

        act(() => {
            result.current.handleAnswerChange('question-1', 'A');
        });

        expect(result.current.answeredCount).toBe(1);
        expect(result.current.answeredQuestionIds).toEqual(['question-1']);
    });
});
