import { describe, expect, it, vi, beforeEach } from 'vitest';
import { shareExam } from './share-exam.service';
import { HTTPException } from 'hono/http-exception';
import { executeTransaction } from '@sentinel/db';

let mockDbClient: any;
let mockTrx: any;

vi.mock('@sentinel/db', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/db')>('@sentinel/db');
    return {
        ...actual,
        executeTransaction: vi.fn(async (callback: (trx: any) => Promise<unknown>) =>
            callback(mockTrx),
        ),
    };
});

function createQuery(result: unknown) {
    const query: any = {
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        execute: vi.fn(async () => result),
        executeTakeFirst: vi.fn(async () => (Array.isArray(result) ? result[0] : result)),
        deleteFrom: vi.fn(() => query),
        insertInto: vi.fn(() => query),
        values: vi.fn(() => query),
        innerJoin: vi.fn(() => query),
    };
    return query;
}

describe('shareExam service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('throws 404 if exam is not found', async () => {
        mockDbClient = {
            selectFrom: vi.fn(() => createQuery(null)),
        };

        await expect(
            shareExam({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userIds: ['user-1'],
                requestingUserId: 'owner-1',
                institutionId: 'inst-1',
            }),
        ).rejects.toThrowError(new HTTPException(404, { message: 'Exam not found.' }));
    });

    it('throws 403 if user is not the owner/creator', async () => {
        mockDbClient = {
            selectFrom: vi.fn(() => createQuery({ exam_id: 'exam-1', created_by: 'owner-2' })),
        };

        await expect(
            shareExam({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userIds: ['user-1'],
                requestingUserId: 'owner-1',
                institutionId: 'inst-1',
            }),
        ).rejects.toThrowError(
            new HTTPException(403, {
                message: 'Forbidden. Only the creator can share this exam.',
            }),
        );
    });

    it('updates shares successfully for owner', async () => {
        const deleteQuery = createQuery([]);
        const insertQuery = createQuery([]);
        const filteredUsers = [{ user_id: 'user-1' }];
        const sharedUsers = [
            {
                user_id: 'user-1',
                first_name: 'Alice',
                last_name: 'Smith',
                email: 'alice@example.com',
            },
        ];

        mockTrx = {
            deleteFrom: vi.fn(() => deleteQuery),
            insertInto: vi.fn(() => insertQuery),
        };

        let selectCallCount = 0;
        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                selectCallCount++;
                if (selectCallCount === 1) {
                    return createQuery({ exam_id: 'exam-1', created_by: 'owner-1' });
                }
                if (table === 'user_profiles') {
                    return createQuery(filteredUsers);
                }
                return createQuery(sharedUsers);
            }),
        };

        deleteQuery.where.mockReturnValue(deleteQuery);
        deleteQuery.execute.mockResolvedValue([]);
        insertQuery.values.mockReturnValue(insertQuery);
        insertQuery.execute.mockResolvedValue([]);

        const result = await shareExam({
            dbClient: mockDbClient,
            examId: 'exam-1',
            userIds: ['user-1'],
            requestingUserId: 'owner-1',
            institutionId: 'inst-1',
        });

        expect(executeTransaction).toHaveBeenCalled();
        expect(result).toEqual(sharedUsers);
    });
});
