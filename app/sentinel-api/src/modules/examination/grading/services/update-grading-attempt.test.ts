import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateGradingAttempt } from './update-grading-attempt.service';
import { HTTPException } from 'hono/http-exception';
import { getGradingAttemptDetail } from './get-grading-attempt-detail.service';
import { appendExamAttemptLifecycleEvent } from '../../lifecycle/services/lifecycle-event.service';

vi.mock('./get-grading-attempt-detail.service', () => ({
    getGradingAttemptDetail: vi.fn(),
}));

vi.mock('../../lifecycle/services/lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn().mockResolvedValue({}),
}));

describe('updateGradingAttempt', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDb = {
            updateTable: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockImplementation(function (this: any) {
                return this;
            }),
            execute: vi.fn().mockResolvedValue([]),
        };
    });

    it('throws HTTPException if attempt is already finalized', async () => {
        vi.mocked(getGradingAttemptDetail).mockResolvedValueOnce({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Final Exam',
                subjectTitle: 'Math',
                studentId: 'student-1',
                studentName: 'John Doe',
                studentNumber: '12345',
                completedAt: '2026-06-27T00:00:00Z',
                score: 80,
                totalScore: 100,
                initialScore: 80,
                status: 'COMPLETED',
                answers: {},
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: '2026-06-27T00:00:00Z',
                    finalizedBy: 'user-1',
                },
                lifecycleState: 'SUBMITTED',
                scoreState: 'FINALIZED',
                questionReports: [],
            },
            questions: [],
        } as any);

        await expect(
            updateGradingAttempt({
                dbClient: mockDb,
                attemptId: 'attempt-1',
                actorUserId: 'user-1',
            }),
        ).rejects.toThrow(
            new HTTPException(400, {
                message: 'Cannot edit grading for a finalized attempt score.',
            }),
        );
    });

    it('updates grading successfully if attempt scoreState is DRAFT', async () => {
        vi.mocked(getGradingAttemptDetail).mockResolvedValueOnce({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Final Exam',
                subjectTitle: 'Math',
                studentId: 'student-1',
                studentName: 'John Doe',
                studentNumber: '12345',
                completedAt: '2026-06-27T00:00:00Z',
                score: 80,
                totalScore: 100,
                initialScore: null,
                status: 'COMPLETED',
                answers: { 'q-1': 'Option A' },
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: null,
                    finalizedBy: null,
                },
                lifecycleState: 'SUBMITTED',
                scoreState: 'DRAFT',
                questionReports: [],
            },
            questions: [
                {
                    id: 'q-1',
                    examId: 'exam-1',
                    type: 'MULTIPLE_CHOICE',
                    points: 10,
                    orderIndex: 0,
                    content: { choices: [{ text: 'Option A', isCorrect: true }] },
                },
            ],
        } as any);

        const result = await updateGradingAttempt({
            dbClient: mockDb,
            attemptId: 'attempt-1',
            actorUserId: 'user-1',
            feedback: 'Good job',
        });

        expect(result.scoreState).toBe('DRAFT');
        expect(mockDb.updateTable).toHaveBeenCalledWith('exam_attempts');
        expect(mockDb.set).toHaveBeenCalled();
    });

    it('updates grading successfully and finalizes score if finalize is true', async () => {
        vi.mocked(getGradingAttemptDetail).mockResolvedValueOnce({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Final Exam',
                subjectTitle: 'Math',
                studentId: 'student-1',
                studentName: 'John Doe',
                studentNumber: '12345',
                completedAt: null,
                score: 80,
                totalScore: 100,
                initialScore: 80,
                status: 'IN_PROGRESS',
                answers: { 'q-1': 'Option A' },
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: null,
                    finalizedBy: null,
                },
                lifecycleState: 'SUBMITTED',
                scoreState: 'DRAFT',
                questionReports: [],
            },
            questions: [
                {
                    id: 'q-1',
                    examId: 'exam-1',
                    type: 'MULTIPLE_CHOICE',
                    points: 10,
                    orderIndex: 0,
                    content: { choices: [{ text: 'Option A', isCorrect: true }] },
                },
            ],
        } as any);

        const result = await updateGradingAttempt({
            dbClient: mockDb,
            attemptId: 'attempt-1',
            actorUserId: 'user-1',
            finalize: true,
        });

        expect(result.scoreState).toBe('FINALIZED');
        expect(appendExamAttemptLifecycleEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptId: 'attempt-1',
                eventType: 'FINALIZED',
            }),
        );
    });

    it('updates grading successfully if attempt scoreState is REVISION_REQUIRED', async () => {
        vi.mocked(getGradingAttemptDetail).mockResolvedValueOnce({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                examTitle: 'Final Exam',
                subjectTitle: 'Math',
                studentId: 'student-1',
                studentName: 'John Doe',
                studentNumber: '12345',
                completedAt: '2026-06-27T00:00:00Z',
                score: 80,
                totalScore: 100,
                initialScore: 80,
                status: 'COMPLETED',
                answers: {},
                evaluations: {},
                feedback: null,
                itemOverrides: {},
                grading: {
                    finalizedAt: null,
                    finalizedBy: null,
                },
                lifecycleState: 'SUBMITTED',
                scoreState: 'REVISION_REQUIRED',
                questionReports: [],
            },
            questions: [],
        } as any);

        const result = await updateGradingAttempt({
            dbClient: mockDb,
            attemptId: 'attempt-1',
            actorUserId: 'user-1',
        });

        expect(result.scoreState).toBe('REVISION_REQUIRED');
    });
});
