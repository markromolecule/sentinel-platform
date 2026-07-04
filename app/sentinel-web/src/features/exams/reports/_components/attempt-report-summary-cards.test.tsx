import { render, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import { AttemptReportSummaryCards } from './attempt-report-summary-cards';
import type { AttemptGradingDetailType } from '@sentinel/shared';
import React from 'react';

afterEach(() => {
    cleanup();
});

const mockAttempt: AttemptGradingDetailType = {
    attemptId: '11111111-1111-1111-1111-111111111111',
    examId: '22222222-2222-2222-2222-222222222222',
    examTitle: 'Midterm Exam',
    subjectTitle: 'Computer Science',
    studentId: '33333333-3333-3333-3333-333333333333',
    studentName: 'John Doe',
    studentNumber: '2026-0001',
    completedAt: '2026-06-28T08:00:00.000Z',
    score: 8,
    totalScore: 10,
    status: 'COMPLETED',
    answers: {},
    evaluations: {},
    feedback: 'Good job!',
    itemOverrides: {},
    grading: {
        finalizedAt: null,
        finalizedBy: null,
    },
    questionReports: [],
};

describe('AttemptReportSummaryCards', () => {
    it('renders the cards with default attempt scores when optimisticScore is not provided', () => {
        const { getByText } = render(<AttemptReportSummaryCards attempt={mockAttempt} />);

        expect(getByText('Final Score')).toBeTruthy();
        expect(getByText('8')).toBeTruthy();
        expect(getByText('/ 10')).toBeTruthy();
        expect(getByText('Good job!')).toBeTruthy();
        expect(getByText('Draft')).toBeTruthy();
    });

    it('renders the cards with optimisticScore when provided', () => {
        const { getByText, queryByText } = render(
            <AttemptReportSummaryCards attempt={mockAttempt} optimisticScore={9} />,
        );

        expect(getByText('Final Score')).toBeTruthy();
        expect(getByText('9')).toBeTruthy();
        expect(queryByText('8')).toBeNull();
        expect(getByText('/ 10')).toBeTruthy();
    });
});
