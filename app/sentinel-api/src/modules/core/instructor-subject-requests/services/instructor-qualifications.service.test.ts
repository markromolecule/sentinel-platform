import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { InstructorQualificationsService } from './instructor-qualifications.service';

function createSelectBuilder<T>(result: T) {
    return {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
        execute: vi.fn().mockResolvedValue(result),
        innerJoin: vi.fn().mockReturnThis(),
    };
}

describe('InstructorQualificationsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('assignQualification', () => {
        it('throws 404 if instructor not found', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(undefined)),
            } as any;

            await expect(
                InstructorQualificationsService.assignQualification(dbClient, {
                    instructorId: 'ins-1',
                    subjectId: 'sub-1',
                    assignedByUserId: 'admin-1',
                    institutionId: 'inst-1',
                }),
            ).rejects.toMatchObject({
                status: 404,
                message: 'Instructor profile not found.',
            });
        });

        it('successfully inserts explicit qualification', async () => {
            const instructor = { instructor_id: 'ins-1', institution_id: 'inst-1' };
            const subject = { subject_id: 'sub-1' };

            const mockInsert = {
                values: vi.fn().mockReturnThis(),
                onConflict: vi.fn().mockReturnThis(),
                execute: vi.fn().mockResolvedValue(undefined),
            };

            const dbClient = {
                selectFrom: vi.fn().mockImplementation((table) => {
                    if (table === 'instructors') return createSelectBuilder(instructor);
                    if (table === 'subjects') return createSelectBuilder(subject);
                    return createSelectBuilder(undefined);
                }),
                insertInto: vi.fn().mockReturnValue(mockInsert),
            } as any;

            await InstructorQualificationsService.assignQualification(dbClient, {
                instructorId: 'ins-1',
                subjectId: 'sub-1',
                assignedByUserId: 'admin-1',
                institutionId: 'inst-1',
            });

            expect(dbClient.insertInto).toHaveBeenCalledWith('instructor_subjects');
            expect(mockInsert.values).toHaveBeenCalledWith(
                expect.objectContaining({
                    instructor_id: 'ins-1',
                    subject_id: 'sub-1',
                    assigned_by_user_id: 'admin-1',
                }),
            );
        });
    });

    describe('revokeQualification', () => {
        it('throws 404 if not found or nothing deleted', async () => {
            const instructor = { instructor_id: 'ins-1', institution_id: 'inst-1' };
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(instructor)),
                deleteFrom: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnThis(),
                    executeTakeFirst: vi.fn().mockResolvedValue({ numDeletedRows: 0n }),
                }),
            } as any;

            await expect(
                InstructorQualificationsService.revokeQualification(dbClient, {
                    instructorId: 'ins-1',
                    subjectId: 'sub-1',
                    institutionId: 'inst-1',
                }),
            ).rejects.toMatchObject({
                status: 404,
                message: 'Qualification assignment not found.',
            });
        });
    });
});
