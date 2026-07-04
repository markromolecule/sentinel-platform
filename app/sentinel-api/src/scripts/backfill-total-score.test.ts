import { beforeEach, describe, expect, it, vi } from 'vitest';
import { backfillTotalScores } from './backfill-total-score';
import { dbClient } from '@sentinel/db';

vi.mock('@sentinel/db', () => {
    const mockDb = {
        selectFrom: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(function (this: any) {
            return this;
        }),
        execute: vi.fn(),
        updateTable: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
    };
    return { dbClient: mockDb };
});

describe('backfillTotalScores', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 0 if no attempts need backfilling', async () => {
        vi.mocked(dbClient.execute).mockResolvedValueOnce([]); // No attempts
        const result = await backfillTotalScores();
        expect(result).toBe(0);
    });

    it('backfills total score for attempts', async () => {
        // First execute call: fetch attempts
        vi.mocked(dbClient.execute).mockResolvedValueOnce([
            { attempt_id: 'attempt-1', exam_id: 'exam-1' },
            { attempt_id: 'attempt-2', exam_id: 'exam-1' },
        ]);

        // Second execute call: fetch exam questions for exam-1
        vi.mocked(dbClient.execute).mockResolvedValueOnce([{ points: 5 }, { points: 5 }]);

        const setSpy = vi.fn().mockReturnThis();
        dbClient.set = setSpy;

        const result = await backfillTotalScores();

        expect(result).toBe(2);
        expect(dbClient.updateTable).toHaveBeenCalledWith('exam_attempts');
        expect(setSpy).toHaveBeenCalledWith({
            total_score: 10,
            last_synced_at: expect.any(Date),
        });
    });
});
