import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bulkFinalizeAttempts } from './bulk-finalize-attempts';
import { HTTPException } from 'hono/http-exception';

describe('bulkFinalizeAttempts', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockDb = {
            selectFrom: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockImplementation(function(this: any) { return this; }),
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
            })
        ).rejects.toThrow(HTTPException);
    });

    it('finalizes non-finalized completed attempts', async () => {
        mockDb.executeTakeFirst.mockResolvedValueOnce({ exam_id: 'exam-1' }); // Exam exists
        mockDb.execute.mockResolvedValueOnce([
            {
                attempt_id: 'attempt-1',
                answer_snapshot: {
                    'q-1': 'A',
                    _grading: {
                        finalizedAt: '2026-06-27T00:00:00Z',
                    },
                },
            },
            {
                attempt_id: 'attempt-2',
                answer_snapshot: {
                    'q-1': 'B',
                },
            },
        ]); // Two attempts, only one finalized

        const result = await bulkFinalizeAttempts({
            dbClient: mockDb,
            examId: 'exam-1',
            actorUserId: 'user-1',
        });

        expect(result.count).toBe(1);
        expect(mockDb.updateTable).toHaveBeenCalledWith('exam_attempts');
        expect(mockDb.set).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalledWith('attempt_id', '=', 'attempt-2');
    });

    it('returns 0 count if all attempts are already finalized', async () => {
        mockDb.executeTakeFirst.mockResolvedValueOnce({ exam_id: 'exam-1' }); // Exam exists
        mockDb.execute.mockResolvedValueOnce([
            {
                attempt_id: 'attempt-1',
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
});
