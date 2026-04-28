'use client';

import { useState } from 'react';
import { type ExamAnswerValue, hasAnswer } from '@/features/exams/_components/engine';

export function useAttemptAnswers() {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ExamAnswerValue>>({});

    const handleAnswerChange = (questionId: string, value: ExamAnswerValue) => {
        setSelectedAnswers((current) => ({ ...current, [questionId]: value }));
    };

    const answeredQuestionIds = Object.entries(selectedAnswers)
        .filter(([, value]) => hasAnswer(value))
        .map(([questionId]) => questionId);

    const answeredCount = answeredQuestionIds.length;

    return {
        selectedAnswers,
        setSelectedAnswers,
        handleAnswerChange,
        answeredQuestionIds,
        answeredCount,
    };
}
