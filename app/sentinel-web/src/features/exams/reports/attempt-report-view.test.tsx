import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach as afterEachTest, describe, expect, it, vi } from 'vitest';
import { AttemptReportView } from './attempt-report-view';

afterEachTest(() => {
    cleanup();
});

describe('AttemptReportView', () => {
    it('submits override edits and finalization intent', () => {
        const onSubmit = vi.fn();

        render(
            <AttemptReportView
                editable
                onSubmit={onSubmit}
                attempt={{
                    attemptId: 'attempt-1',
                    examId: 'exam-1',
                    examTitle: 'Final Exam',
                    subjectTitle: 'Algorithms',
                    studentId: 'student-1',
                    studentName: 'Ana Santos',
                    studentNumber: '2024-0001',
                    completedAt: '2026-06-26T09:00:00.000Z',
                    score: 8,
                    totalScore: 10,
                    status: 'COMPLETED',
                    answers: {
                        'question-1': 'A',
                    },
                    evaluations: {},
                    feedback: 'Overall feedback',
                    itemOverrides: {},
                    grading: {
                        finalizedAt: null,
                        finalizedBy: null,
                    },
                    questionReports: [
                        {
                            questionId: 'question-1',
                            questionType: 'MULTIPLE_CHOICE',
                            prompt: 'Question prompt',
                            answer: 'A',
                            correctAnswer: 'B',
                            isCorrect: false,
                            awardedScore: 0,
                            maxScore: 5,
                            evaluation: null,
                            override: null,
                        },
                    ],
                }}
                questions={[
                    {
                        id: 'question-1',
                        examId: 'exam-1',
                        type: 'MULTIPLE_CHOICE',
                        content: {
                            prompt: 'Question prompt',
                        },
                        points: 5,
                        orderIndex: 0,
                    } as any,
                ]}
            />,
        );

        fireEvent.change(screen.getByLabelText('Override Score'), {
            target: { value: '4' },
        });
        fireEvent.change(screen.getByLabelText('Override Reason'), {
            target: { value: 'Accepted alternate reasoning.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save & Finalize Report' }));

        expect(onSubmit).toHaveBeenCalledWith({
            itemOverrides: {
                'question-1': {
                    awardedScore: 4,
                    reason: 'Accepted alternate reasoning.',
                },
            },
            finalize: true,
        });
    });

    it('renders readonly report content without instructor actions', () => {
        render(
            <AttemptReportView
                attempt={{
                    attemptId: 'attempt-2',
                    examId: 'exam-2',
                    examTitle: 'Student View',
                    subjectTitle: 'English',
                    studentId: 'student-2',
                    studentName: 'Luis Reyes',
                    studentNumber: '2024-0002',
                    completedAt: '2026-06-26T09:00:00.000Z',
                    score: 18,
                    totalScore: 20,
                    status: 'COMPLETED',
                    answers: {
                        'question-1': 'Essay response',
                    },
                    evaluations: {},
                    feedback: 'Strong work overall.',
                    itemOverrides: {},
                    grading: {
                        finalizedAt: '2026-06-26T10:00:00.000Z',
                        finalizedBy: 'user-1',
                    },
                    questionReports: [
                        {
                            questionId: 'question-1',
                            questionType: 'ESSAY',
                            prompt: 'Question prompt',
                            answer: 'Essay response',
                            correctAnswer: null,
                            isCorrect: null,
                            awardedScore: 18,
                            maxScore: 20,
                            evaluation: {
                                scores: {
                                    contentSubstance: 4,
                                    structureOrganization: 4,
                                    argumentationSupport: 3,
                                    styleTone: 3,
                                    grammarConventions: 4,
                                },
                            },
                            override: null,
                        },
                    ],
                }}
                questions={[
                    {
                        id: 'question-1',
                        examId: 'exam-2',
                        type: 'ESSAY',
                        sourceFileName: 'reading-pack.pdf',
                        sourcePageNumber: 7,
                        sourceEvidence: 'Legacy source evidence should not be shown first.',
                        passageContent: '<p><strong>Rendered passage</strong></p>',
                        passageType: 'html',
                        content: {
                            prompt: 'Question prompt',
                        },
                        points: 20,
                        orderIndex: 0,
                    } as any,
                ]}
            />,
        );

        expect(screen.getByText('Strong work overall.')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Save Overrides' })).toBeNull();
        expect(screen.queryByLabelText('Override Score')).toBeNull();
        expect(screen.getByText('Passage')).toBeTruthy();
        expect(screen.getByText('reading-pack.pdf')).toBeTruthy();
        expect(screen.getByText(/Referenced page 7/)).toBeTruthy();
        expect(screen.getByText('Rendered passage')).toBeTruthy();
        expect(screen.queryByText('Legacy source evidence should not be shown first.')).toBeNull();
    });
});
