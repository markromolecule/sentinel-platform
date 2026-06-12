import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { getGradingAttemptDetail } from './get-grading-attempt-detail';
import { updateGradingAttempt } from './update-grading-attempt';
import { calculateEssayWeightedScore, scoreExamAttempt } from '@sentinel/shared';

vi.mock('@sentinel/shared', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@sentinel/shared')>();
    return {
        ...actual,
        scoreExamAttempt: vi.fn(),
        calculateEssayWeightedScore: vi.fn(),
    };
});

describe('Grading attempt details and update services', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDb = {
            selectFrom: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            $if: vi.fn().mockImplementation(function (this: any, condition: boolean, callback: any) {
                if (condition) {
                    return callback(this);
                }
                return this;
            }),
            executeTakeFirst: vi.fn(),
            execute: vi.fn(),
            updateTable: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
        };
    });

    describe('getGradingAttemptDetail', () => {
        it('fetches attempt, filters special properties from answers, and parses existing evaluations', async () => {
            const mockAttempt = {
                attemptId: '11111111-1111-1111-1111-111111111111',
                examId: '22222222-2222-2222-2222-222222222222',
                examTitle: 'History Final',
                subjectTitle: 'History',
                studentId: '33333333-3333-3333-3333-333333333333',
                studentNumber: '2026-0001',
                completedAt: new Date('2026-04-18T09:30:00.000Z'),
                score: 8,
                totalScore: 10,
                status: 'COMPLETED',
                answerSnapshot: {
                    'q-obj-1': 'A',
                    'q-essay-1': 'Student essay response text',
                    _evaluations: {
                        'q-essay-1': {
                            scores: {
                                contentSubstance: 3,
                                structureOrganization: 4,
                                argumentationSupport: 3,
                                styleTone: 3,
                                grammarConventions: 4,
                            },
                            score: 3.4,
                            feedback: 'Good work',
                        },
                    },
                    _feedback: 'Overall solid effort.',
                },
                studentName: 'Alice Student',
            };

            const mockQuestions = [
                {
                    id: 'q-obj-1',
                    examId: '22222222-2222-2222-2222-222222222222',
                    type: 'MULTIPLE_CHOICE',
                    content: { prompt: 'Objective Prompt', options: ['A', 'B'] },
                    points: 5,
                    orderIndex: 0,
                },
                {
                    id: 'q-essay-1',
                    examId: '22222222-2222-2222-2222-222222222222',
                    type: 'ESSAY',
                    content: { prompt: 'Essay Prompt', maxLength: 1000 },
                    points: 5,
                    orderIndex: 1,
                },
            ];

            mockDb.executeTakeFirst.mockResolvedValue(mockAttempt);
            mockDb.execute.mockResolvedValue(mockQuestions);

            const result = await getGradingAttemptDetail({
                dbClient: mockDb as DbClient,
                attemptId: '11111111-1111-1111-1111-111111111111',
            });

            expect(result.attempt.answers).toEqual({
                'q-obj-1': 'A',
                'q-essay-1': 'Student essay response text',
            });
            expect(result.attempt.evaluations).toEqual(mockAttempt.answerSnapshot._evaluations);
            expect(result.attempt.feedback).toBe('Overall solid effort.');
            expect(result.questions).toHaveLength(2);
        });
    });

    describe('updateGradingAttempt', () => {
        it('scores objective questions and integrates manual essay weighted scores', async () => {
            const mockAttempt = {
                attemptId: '11111111-1111-1111-1111-111111111111',
                examId: '22222222-2222-2222-2222-222222222222',
                examTitle: 'History Final',
                subjectTitle: 'History',
                studentId: '33333333-3333-3333-3333-333333333333',
                studentNumber: '2026-0001',
                completedAt: new Date('2026-04-18T09:30:00.000Z'),
                score: 5,
                totalScore: 10,
                status: 'COMPLETED',
                answerSnapshot: {
                    'q-obj-1': 'A',
                    'q-essay-1': 'Student essay response text',
                },
                studentName: 'Alice Student',
            };

            const mockQuestions = [
                {
                    id: 'q-obj-1',
                    examId: '22222222-2222-2222-2222-222222222222',
                    type: 'MULTIPLE_CHOICE',
                    content: { prompt: 'Objective Prompt', options: ['A', 'B'] },
                    points: 5,
                    orderIndex: 0,
                },
                {
                    id: 'q-essay-1',
                    examId: '22222222-2222-2222-2222-222222222222',
                    type: 'ESSAY',
                    content: { prompt: 'Essay Prompt', maxLength: 1000 },
                    points: 5,
                    orderIndex: 1,
                },
            ];

            mockDb.executeTakeFirst.mockResolvedValue(mockAttempt);
            mockDb.execute.mockResolvedValue(mockQuestions);

            // Mock auto-grade results
            vi.mocked(scoreExamAttempt).mockReturnValue({
                score: 5, // Auto-graded score for objective item
                totalScore: 10,
                percentage: 50,
                answeredCount: 2,
                autoGradableQuestionCount: 1,
                manualReviewQuestionCount: 1,
                requiresManualReview: true,
            });

            // Mock essay weighted score calculation: Content(4), all others (4) -> 4 points (100% of 5 max points) -> 5
            vi.mocked(calculateEssayWeightedScore).mockReturnValue(3.5);

            const evaluationsInput = {
                'q-essay-1': {
                    scores: {
                        contentSubstance: 3,
                        structureOrganization: 4,
                        argumentationSupport: 3,
                        styleTone: 3,
                        grammarConventions: 4,
                    },
                    feedback: 'Nice argument structures.',
                },
            };

            const executeUpdateMock = vi.fn();
            mockDb.execute.mockImplementation(async () => {
                if (mockDb.execute.mock.calls.length === 1) {
                    return mockQuestions;
                }
                executeUpdateMock();
                return [];
            });

            const result = await updateGradingAttempt({
                dbClient: mockDb as DbClient,
                attemptId: '11111111-1111-1111-1111-111111111111',
                evaluations: evaluationsInput,
                feedback: 'Nice job Alice!',
            });

            // Auto score (5) + Essay score (3.5) = 8.5 -> rounds to 9
            expect(result.score).toBe(9);
            expect(scoreExamAttempt).toHaveBeenCalled();
            expect(calculateEssayWeightedScore).toHaveBeenCalledWith(
                evaluationsInput['q-essay-1'].scores,
                5,
            );
        });
    });
});
