import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    getExamSharesRouteHandler,
    shareExamRouteHandler,
    unshareExamRouteHandler,
} from './exam-sharing.controller';
import { shareExam } from '../services/share-exam.service';
import { unshareExam } from '../services/unshare-exam.service';
import { HTTPException } from 'hono/http-exception';

let mockDbClient: any;

vi.mock('../services/share-exam.service', () => ({
    shareExam: vi.fn(),
}));

vi.mock('../services/unshare-exam.service', () => ({
    unshareExam: vi.fn(),
}));

function createQuery(result: unknown) {
    const query: any = {
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        execute: vi.fn(async () => result),
        executeTakeFirst: vi.fn(async () => (Array.isArray(result) ? result[0] : result)),
        innerJoin: vi.fn(() => query),
    };
    return query;
}

function createContext({
    params,
    json,
}: {
    params: Record<string, string>;
    json?: Record<string, unknown>;
}) {
    return {
        req: {
            valid: (type: string) => (type === 'param' ? params : json),
        },
        get: (key: string) => {
            if (key === 'dbClient') {
                return mockDbClient;
            }
            if (key === 'user') {
                return { id: 'instructor-1' };
            }
            if (key === 'institutionId') {
                return 'inst-1';
            }
            return undefined;
        },
        json: vi.fn((payload: unknown) => payload),
    } as any;
}

describe('exam sharing controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getExamSharesRouteHandler', () => {
        it('returns shared users for owner', async () => {
            const sharedUsers = [
                {
                    user_id: 'user-2',
                    first_name: 'Alice',
                    last_name: 'Smith',
                    email: 'alice@example.com',
                },
            ];

            let selectCallCount = 0;
            mockDbClient = {
                selectFrom: vi.fn(() => {
                    selectCallCount++;
                    if (selectCallCount === 1) {
                        return createQuery({ exam_id: 'exam-1', created_by: 'instructor-1' });
                    }
                    if (selectCallCount === 2) {
                        return createQuery(null); // isShared check
                    }
                    return createQuery(sharedUsers);
                }),
            };

            const c = createContext({ params: { id: 'exam-1' } });
            const result = await getExamSharesRouteHandler(c, vi.fn());

            expect(result).toEqual({
                message: 'Shared users fetched successfully',
                data: sharedUsers,
            });
        });

        it('throws 403 if user has no access to exam', async () => {
            let selectCallCount = 0;
            mockDbClient = {
                selectFrom: vi.fn(() => {
                    selectCallCount++;
                    if (selectCallCount === 1) {
                        return createQuery({
                            exam_id: 'exam-1',
                            created_by: 'instructor-2',
                            is_public: false,
                        });
                    }
                    return createQuery(null); // isShared check
                }),
            };

            const c = createContext({ params: { id: 'exam-1' } });
            await expect(getExamSharesRouteHandler(c, vi.fn())).rejects.toThrowError(
                new HTTPException(403, {
                    message: 'Forbidden. You do not have access to this exam.',
                }),
            );
        });
    });

    describe('shareExamRouteHandler', () => {
        it('calls shareExam service and returns result', async () => {
            const sharedUsers = [
                {
                    user_id: 'user-2',
                    first_name: 'Alice',
                    last_name: 'Smith',
                    email: 'alice@example.com',
                },
            ];

            vi.mocked(shareExam).mockResolvedValue(sharedUsers);

            const c = createContext({
                params: { id: 'exam-1' },
                json: { userIds: ['user-2'] },
            });

            const result = await shareExamRouteHandler(c, vi.fn());

            expect(shareExam).toHaveBeenCalledWith({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userIds: ['user-2'],
                requestingUserId: 'instructor-1',
                institutionId: 'inst-1',
            });
            expect(result).toEqual({
                message: 'Exam shared successfully',
                data: sharedUsers,
            });
        });
    });

    describe('unshareExamRouteHandler', () => {
        it('calls unshareExam service and returns success', async () => {
            vi.mocked(unshareExam).mockResolvedValue(undefined);

            const c = createContext({
                params: { id: 'exam-1', userId: 'user-2' },
            });

            const result = await unshareExamRouteHandler(c, vi.fn());

            expect(unshareExam).toHaveBeenCalledWith({
                dbClient: mockDbClient,
                examId: 'exam-1',
                userId: 'user-2',
                requestingUserId: 'instructor-1',
            });
            expect(result).toEqual({
                message: 'Exam share removed successfully',
                data: null,
            });
        });
    });
});
