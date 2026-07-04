import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bulkFinalizeAttempts } from './bulk-finalize-attempts';
import { HTTPException } from 'hono/http-exception';
import { finalizeExamAttemptScore } from '../../lifecycle/services/finalize-exam-attempt-score';

vi.mock('../../lifecycle/services/finalize-exam-attempt-score', () => ({
    finalizeExamAttemptScore: vi.fn().mockResolvedValue({}),
}));

describe('bulkFinalizeAttempts', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDb = {
            selectFrom: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockImplementation(function (this: any) {
                return this;
            }),
            executeTakeFirst: vi.fn(),
            execute: vi.fn(),
            updateTable: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
        };
    });

    it('throws 404 if exam is not found', async () => {
        mockDb.executeTakeFirst.mockResolvedValueOnce(undefined); // No exam

        await expect(
            bulkFinalizeAttempts({
                dbClient: mockDb,
                examId: 'exam-1',
                actorUserId: 'user-1',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('finalizes non-finalized completed attempts', async () => {
        mockDb.executeTakeFirst.mockResolvedValueOnce({ exam_id: 'exam-1' }); // Exam exists
        // First execute call: fetch attempts
        mockDb.execute.mockResolvedValueOnce([
            {
                attempt_id: 'attempt-1',
                status: 'COMPLETED',
                completed_at: '2026-06-27T00:00:00Z',
                total_score: 10,
                answer_snapshot: {
                    'q-1': 'A',
                    _grading: {
                        finalizedAt: '2026-06-27T00:00:00Z',
                    },
                },
            },
            {
                attempt_id: 'attempt-2',
                status: 'COMPLETED',
                completed_at: '2026-06-27T00:00:00Z',
                total_score: 10,
                answer_snapshot: {
                    'q-1': 'B',
                },
            },
        ]);
        // Second execute call: fetch exam questions
        mockDb.execute.mockResolvedValueOnce([{ points: 5 }, { points: 5 }]);

        const result = await bulkFinalizeAttempts({
            dbClient: mockDb,
            examId: 'exam-1',
            actorUserId: 'user-1',
        });

        expect(result.count).toBe(1);
        expect(mockDb.updateTable).toHaveBeenCalledWith('exam_attempts');
        expect(mockDb.set).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalledWith('attempt_id', '=', 'attempt-2');
        expect(finalizeExamAttemptScore).toHaveBeenCalledWith(
            expect.objectContaining({ attemptId: 'attempt-2' }),
        );
    });

    it('returns 0 count if all attempts are already finalized', async () => {
        mockDb.executeTakeFirst.mockResolvedValueOnce({ exam_id: 'exam-1' }); // Exam exists
        mockDb.execute.mockResolvedValueOnce([
            {
                attempt_id: 'attempt-1',
                status: 'COMPLETED',
                completed_at: '2026-06-27T00:00:00Z',
                total_score: 10,
                answer_snapshot: {
                    'q-1': 'A',
                    _grading: {
                        finalizedAt: '2026-06-27T00:00:00Z',
                    },
                },
            },
        ]);

        const result = await bulkFinalizeAttempts({
            dbClient: mockDb,
            examId: 'exam-1',
            actorUserId: 'user-1',
        });

        expect(result.count).toBe(0);
        expect(mockDb.updateTable).not.toHaveBeenCalled();
    });

    it('transitions IN_PROGRESS attempts and populates total_score', async () => {
        mockDb.executeTakeFirst.mockResolvedValueOnce({ exam_id: 'exam-1' });
        // First execute call: fetch attempts
        mockDb.execute.mockResolvedValueOnce([
            {
                attempt_id: 'attempt-in-progress',
                status: 'IN_PROGRESS',
                completed_at: null,
                total_score: null,
                answer_snapshot: {},
            },
        ]);
        // Second execute call: fetch exam questions
        mockDb.execute.mockResolvedValueOnce([{ points: 10 }]);

        const setSpy = vi.fn().mockReturnThis();
        mockDb.set = setSpy;

        const result = await bulkFinalizeAttempts({
            dbClient: mockDb,
            examId: 'exam-1',
            actorUserId: 'user-1',
        });

        expect(result.count).toBe(1);
        const lastCallArgs = setSpy.mock.calls[0][0];
        expect(lastCallArgs.status).toBe('COMPLETED');
        expect(lastCallArgs.completed_at).toBeDefined();
        expect(lastCallArgs.total_score).toBe(10);
    });
});
