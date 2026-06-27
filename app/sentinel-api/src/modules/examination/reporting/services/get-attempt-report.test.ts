import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getAttemptReport } from './get-attempt-report';
import { getGradingAttemptDetail } from '../../grading/services/get-grading-attempt-detail';

vi.mock('../../grading/services/get-grading-attempt-detail', () => ({
    getGradingAttemptDetail: vi.fn(),
}));

describe('getAttemptReport', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDb = {
            selectFrom: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            $if: vi.fn().mockImplementation(function (this: any, condition: boolean, callback: any) {
                if (condition) {
                    return callback(this);
                }

                return this;
            }),
            executeTakeFirst: vi.fn(),
        };
    });

    it('returns objective-only student reports immediately after completion', async () => {
        mockDb.executeTakeFirst.mockResolvedValue({
            attemptId: 'attempt-1',
            completedAt: new Date('2026-06-26T10:00:00.000Z'),
        });

        vi.mocked(getGradingAttemptDetail).mockResolvedValue({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Objective Exam',
                subjectTitle: 'Science',
                studentId: 'student-1',
                studentName: 'Student One',
                studentNumber: '2026-0001',
                completedAt: '2026-06-26T10:00:00.000Z',
                score: 8,
                totalScore: 10,
                status: 'COMPLETED',
                answers: {},
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: null,
                    finalizedBy: null,
                },
                questionReports: [],
            },
            questions: [
                {
                    id: 'question-1',
                    examId: 'exam-1',
                    type: 'MULTIPLE_CHOICE',
                    content: { prompt: 'Prompt', correctAnswer: 'A' },
                    points: 5,
                    orderIndex: 0,
                },
            ],
        } as any);

        const result = await getAttemptReport({
            dbClient: mockDb as DbClient,
            attemptId: 'attempt-1',
            viewerRole: 'student',
            userId: 'user-1',
        });

        expect(result.attempt.examTitle).toBe('Objective Exam');
    });

    it('blocks essay reports until grading is finalized', async () => {
        mockDb.executeTakeFirst.mockResolvedValue({
            attemptId: 'attempt-2',
            completedAt: new Date('2026-06-26T10:00:00.000Z'),
        });

        vi.mocked(getGradingAttemptDetail).mockResolvedValue({
            attempt: {
                attemptId: 'attempt-2',
                examId: 'exam-2',
                examTitle: 'Essay Exam',
                subjectTitle: 'English',
                studentId: 'student-1',
                studentName: 'Student One',
                studentNumber: '2026-0001',
                completedAt: '2026-06-26T10:00:00.000Z',
                score: 8,
                totalScore: 10,
                status: 'COMPLETED',
                answers: {},
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: null,
                    finalizedBy: null,
                },
                questionReports: [],
            },
            questions: [
                {
                    id: 'question-essay-1',
                    examId: 'exam-2',
                    type: 'ESSAY',
                    content: { prompt: 'Prompt' },
                    points: 10,
                    orderIndex: 0,
                },
            ],
        } as any);

        await expect(
            getAttemptReport({
                dbClient: mockDb as DbClient,
                attemptId: 'attempt-2',
                viewerRole: 'student',
                userId: 'user-1',
            }),
        ).rejects.toBeInstanceOf(HTTPException);

        await expect(
            getAttemptReport({
                dbClient: mockDb as DbClient,
                attemptId: 'attempt-2',
                viewerRole: 'student',
                userId: 'user-1',
            }),
        ).rejects.toMatchObject({ status: 409 });
    });

    it('rejects student report access for attempts they do not own', async () => {
        mockDb.executeTakeFirst.mockResolvedValue(undefined);

        await expect(
            getAttemptReport({
                dbClient: mockDb as DbClient,
                attemptId: 'attempt-3',
                viewerRole: 'student',
                userId: 'user-1',
            }),
        ).rejects.toMatchObject({ status: 404 });

        expect(getGradingAttemptDetail).not.toHaveBeenCalled();
    });

    it('blocks objective reports if release_score_mode is MANUAL_RELEASE and not finalized', async () => {
        mockDb.executeTakeFirst.mockImplementation(async () => {
            if (mockDb.selectFrom.mock.calls.length === 1) {
                return {
                    attemptId: 'attempt-1',
                    completedAt: new Date('2026-06-26T10:00:00.000Z'),
                };
            }
            return {
                release_score_mode: 'MANUAL_RELEASE',
            };
        });

        vi.mocked(getGradingAttemptDetail).mockResolvedValue({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Objective Exam',
                subjectTitle: 'Science',
                studentId: 'student-1',
                studentName: 'Student One',
                studentNumber: '2026-0001',
                completedAt: '2026-06-26T10:00:00.000Z',
                score: 8,
                totalScore: 10,
                status: 'COMPLETED',
                answers: {},
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: null,
                    finalizedBy: null,
                },
                questionReports: [],
            },
            questions: [
                {
                    id: 'question-1',
                    examId: 'exam-1',
                    type: 'MULTIPLE_CHOICE',
                    content: { prompt: 'Prompt', correctAnswer: 'A' },
                    points: 5,
                    orderIndex: 0,
                },
            ],
        } as any);

        await expect(
            getAttemptReport({
                dbClient: mockDb as DbClient,
                attemptId: 'attempt-1',
                viewerRole: 'student',
                userId: 'user-1',
            }),
        ).rejects.toMatchObject({ status: 409 });
    });
});
