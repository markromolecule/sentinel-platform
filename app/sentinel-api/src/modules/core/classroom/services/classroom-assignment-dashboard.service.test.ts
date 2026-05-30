import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassroomAssignmentDashboardService } from './classroom-assignment-dashboard.service';

function createSelectBuilder<T>(result: T) {
    return {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
        execute: vi.fn().mockResolvedValue(result),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
    };
}

describe('ClassroomAssignmentDashboardService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUnassignedClassrooms', () => {
        it('queries classrooms without head instructor assigned', async () => {
            const mockClassrooms = [{ class_group_id: 'class-1', class_name: 'CS 101' }];
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(mockClassrooms)),
            } as any;

            const results = await ClassroomAssignmentDashboardService.getUnassignedClassrooms(dbClient, 'inst-1');
            expect(results).toEqual(mockClassrooms);
            expect(dbClient.selectFrom).toHaveBeenCalledWith('class_groups as cg');
        });
    });

    describe('getInstructorLoadSummary', () => {
        it('aggregates active instructor workload counts', async () => {
            const mockLoads = [{ instructor_user_id: 'user-1', load_count: 3 }];
            const mockInstructors = [
                { instructor_id: 'ins-1', user_id: 'user-1', employee_number: 'E1', name: 'Dr. John' },
            ];

            const dbClient = {
                selectFrom: vi.fn().mockImplementation((table) => {
                    if (table === 'classroom_instructor_assignments as cia') {
                        return createSelectBuilder(mockLoads);
                    }
                    return createSelectBuilder(mockInstructors);
                }),
            } as any;

            const summary = await ClassroomAssignmentDashboardService.getInstructorLoadSummary(dbClient, {
                institutionId: 'inst-1',
            });

            expect(summary).toHaveLength(1);
            expect(summary[0]).toMatchObject({
                classroom_count: 3,
                name: 'Dr. John',
            });
        });
    });
});
