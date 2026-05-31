import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listRequests, getRequestById } from './instructor-subject-requests-query.service';

function createSelectBuilder<T>(result: T) {
    return {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
        execute: vi.fn().mockResolvedValue(result),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
    };
}

describe('instructor subject requests query service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('listRequests', () => {
        it('returns correctly formatted and filtered requests list', async () => {
            const mockRequest = {
                request_id: 'req-1',
                instructor_id: 'ins-1',
                instructor_user_id: 'user-1',
                instructor_name: 'Ana Reyes',
                subject_id: 'sub-1',
                subject_code: 'MATH101',
                subject_title: 'Algebra',
                status: 'PENDING',
                justification: 'Tests',
                reviewer_user_id: null,
                reviewer_name: null,
                reviewed_at: null,
                review_comments: null,
                created_at: '2026-05-15T08:00:00.000Z',
                updated_at: '2026-05-15T08:00:00.000Z',
            };

            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder([mockRequest])),
            } as any;

            const result = await listRequests(dbClient, {
                instructorUserId: 'user-1',
                status: 'PENDING',
                institutionId: 'inst-1',
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                request_id: 'req-1',
                created_at: '2026-05-15T08:00:00.000Z',
            });
        });
    });

    describe('getRequestById', () => {
        it('returns null if request is not found', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(undefined)),
            } as any;

            const result = await getRequestById(dbClient, 'req-2');
            expect(result).toBeNull();
        });

        it('returns request data with ISO string dates', async () => {
            const mockRequest = {
                request_id: 'req-1',
                created_at: '2026-05-15T08:00:00.000Z',
                updated_at: '2026-05-15T08:00:00.000Z',
                reviewed_at: '2026-05-16T08:00:00.000Z',
            };

            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(mockRequest)),
            } as any;

            const result = await getRequestById(dbClient, 'req-1');
            expect(result).toMatchObject({
                request_id: 'req-1',
                created_at: '2026-05-15T08:00:00.000Z',
            });
        });
    });
});
