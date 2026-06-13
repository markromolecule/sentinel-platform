import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bulkDeleteClassrooms } from './classroom-write.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { HTTPException } from 'hono/http-exception';

vi.mock('../../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifyInstitutionActivityDeleted: vi.fn().mockResolvedValue(undefined),
    },
}));

function createSelectBuilder(result: any) {
    return {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(result),
    };
}

function createDeleteBuilder() {
    return {
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
    };
}

describe('classroom-write.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('bulkDeleteClassrooms', () => {
        it('throws 404 if no classrooms are found', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder([])),
            } as any;

            await expect(
                bulkDeleteClassrooms(dbClient, {
                    classGroupIds: ['class-1'],
                    userId: 'user-1',
                    institutionId: 'inst-1',
                    userRole: 'instructor',
                }),
            ).rejects.toThrow(HTTPException);
        });

        it('deletes classrooms and logs notifications for instructors', async () => {
            const mockClassrooms = [
                { class_group_id: 'class-1', class_name: 'CS 101' },
                { class_group_id: 'class-2', class_name: 'CS 102' },
            ];

            const selectBuilder = createSelectBuilder(mockClassrooms);
            const deleteBuilder = createDeleteBuilder();

            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(selectBuilder),
                deleteFrom: vi.fn().mockReturnValue(deleteBuilder),
            } as any;

            await bulkDeleteClassrooms(dbClient, {
                classGroupIds: ['class-1', 'class-2'],
                userId: 'user-1',
                institutionId: 'inst-1',
                userRole: 'instructor',
            });

            expect(dbClient.selectFrom).toHaveBeenCalledWith('class_groups as cg');
            expect(selectBuilder.innerJoin).toHaveBeenCalledTimes(2); // joins class_roles and roles
            expect(dbClient.deleteFrom).toHaveBeenCalledWith('class_groups');
            expect(deleteBuilder.where).toHaveBeenCalledWith('class_group_id', 'in', [
                'class-1',
                'class-2',
            ]);
            expect(
                ActivityNotificationService.notifyInstitutionActivityDeleted,
            ).toHaveBeenCalledTimes(2);
        });

        it('deletes classrooms without joining roles for core admins', async () => {
            const mockClassrooms = [{ class_group_id: 'class-1', class_name: 'CS 101' }];

            const selectBuilder = createSelectBuilder(mockClassrooms);
            const deleteBuilder = createDeleteBuilder();

            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(selectBuilder),
                deleteFrom: vi.fn().mockReturnValue(deleteBuilder),
            } as any;

            await bulkDeleteClassrooms(dbClient, {
                classGroupIds: ['class-1'],
                userId: 'admin-1',
                institutionId: 'inst-1',
                userRole: 'admin',
            });

            expect(dbClient.selectFrom).toHaveBeenCalledWith('class_groups as cg');
            expect(selectBuilder.innerJoin).not.toHaveBeenCalled();
            expect(dbClient.deleteFrom).toHaveBeenCalledWith('class_groups');
            expect(deleteBuilder.where).toHaveBeenCalledWith('class_group_id', 'in', ['class-1']);
            expect(
                ActivityNotificationService.notifyInstitutionActivityDeleted,
            ).toHaveBeenCalledTimes(1);
        });
    });
});
