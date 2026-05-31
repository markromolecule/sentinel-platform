import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listClassroomInstructors } from './classroom-instructor-query.service';
import { getAccessibleClassroomOrThrow } from './classroom-access-query.service';

vi.mock('./classroom-access-query.service', () => ({
    getAccessibleClassroomOrThrow: vi.fn(),
}));

function createSelectBuilder<T>(result: T) {
    return {
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
        execute: vi.fn().mockResolvedValue(result),
    };
}

describe('classroom instructor query service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists multiple classroom instructors with head metadata', async () => {
        vi.mocked(getAccessibleClassroomOrThrow).mockResolvedValue({
            class_group_id: 'class-1',
            class_name: 'Physics 101 - BSCS 3A',
            updated_by_name: 'Head Instructor',
        } as any);

        const listBuilder = createSelectBuilder([
            {
                user_id: 'head-1',
                name: 'Head Instructor',
                is_head: true,
                assigned_at: '2026-05-09T08:00:00.000Z',
                assigned_by_user_id: 'head-1',
                assigned_by_name: 'Head Instructor',
            },
            {
                user_id: 'member-1',
                name: 'Member Instructor',
                is_head: false,
                assigned_at: '2026-05-09T09:00:00.000Z',
                assigned_by_user_id: 'head-1',
                assigned_by_name: 'Head Instructor',
            },
        ]);

        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(listBuilder),
        } as any;

        const result = await listClassroomInstructors({
            dbClient,
            classGroupId: 'class-1',
            userId: 'viewer-1',
            institutionId: 'institution-1',
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
            user_id: 'head-1',
            is_head: true,
        });
        expect(result[1]).toMatchObject({
            user_id: 'member-1',
            is_head: false,
        });
    });
});
