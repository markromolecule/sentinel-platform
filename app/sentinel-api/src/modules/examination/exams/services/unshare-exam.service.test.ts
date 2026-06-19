import { describe, expect, it, vi, beforeEach } from 'vitest';
import { unshareExam } from './unshare-exam.service';
import { HTTPException } from 'hono/http-exception';

let mockDbClient: any;

function createQuery(result: unknown) {
    const query: any = {
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        execute: vi.fn(async () => result),
        executeTakeFirst: vi.fn(async () => (Array.isArray(result) ? result[0] : result)),
        deleteFrom: vi.fn(() => query),
    };
    return query;
}

describe('unshareExam service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('throws 404 if exam is not found', async () => {
        mockDbClient = {
            selectFrom: vi.fn(() => createQuery(null)),
        };

        await expect(
            unshareExam({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userId: 'user-1',
                requestingUserId: 'owner-1',
            }),
        ).rejects.toThrowError(new HTTPException(404, { message: 'Exam not found.' }));
    });

    it('throws 403 if user is not the owner/creator', async () => {
        mockDbClient = {
            selectFrom: vi.fn(() => createQuery({ exam_id: 'exam-1', created_by: 'owner-2' })),
        };

        await expect(
            unshareExam({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userId: 'user-1',
                requestingUserId: 'owner-1',
            }),
        ).rejects.toThrowError(
            new HTTPException(403, {
                message: 'Forbidden. Only the creator can unshare this exam.',
            }),
        );
    });

    it('removes the share successfully for owner', async () => {
        const deleteQuery = createQuery([]);
        mockDbClient = {
            selectFrom: vi.fn(() => createQuery({ exam_id: 'exam-1', created_by: 'owner-1' })),
            deleteFrom: vi.fn(() => deleteQuery),
        };

        deleteQuery.where.mockReturnValue(deleteQuery);
        deleteQuery.execute.mockResolvedValue([]);

        await expect(
            unshareExam({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userId: 'user-1',
                requestingUserId: 'owner-1',
            }),
        ).resolves.not.toThrow();

        expect(mockDbClient.deleteFrom).toHaveBeenCalledWith('exam_shares');
    });
});
