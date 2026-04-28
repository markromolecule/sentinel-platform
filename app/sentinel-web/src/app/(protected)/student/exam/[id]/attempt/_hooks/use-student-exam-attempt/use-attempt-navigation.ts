'use client';

import { useState } from 'react';

export type UseAttemptNavigationArgs = {
    totalQuestions: number;
};

export function useAttemptNavigation({ totalQuestions }: UseAttemptNavigationArgs) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const safeQuestionIndex =
        totalQuestions > 0 ? Math.min(currentQuestionIndex, totalQuestions - 1) : 0;

    const moveQuestionIndex = (direction: 'previous' | 'next') => {
        setCurrentQuestionIndex((current) =>
            direction === 'previous'
                ? Math.max(current - 1, 0)
                : Math.min(current + 1, totalQuestions - 1),
        );
    };

    return {
        currentQuestionIndex: safeQuestionIndex,
        setCurrentQuestionIndex,
        moveQuestionIndex,
    };
}
