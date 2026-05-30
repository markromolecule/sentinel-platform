import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { InstructorSubjectRequestsService } from './instructor-subject-requests.service';
import { executeTransaction } from '@sentinel/db';

vi.mock('@sentinel/db', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/db')>('@sentinel/db');
    return {
        ...actual,
        executeTransaction: vi.fn(),
    };
});

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

describe('InstructorSubjectRequestsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('submitRequest', () => {
        it('throws 404 if instructor not found', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(undefined)),
            } as any;

            await expect(
                InstructorSubjectRequestsService.submitRequest(dbClient, {
                    instructorUserId: 'user-1',
                    subjectId: 'subject-1',
                    institutionId: 'inst-1',
                }),
            ).rejects.toMatchObject({
                status: 404,
                message: 'Instructor record not found.',
            });
        });

        it('throws 409 if already qualified', async () => {
            const instructor = { instructor_id: 'ins-1', institution_id: 'inst-1' };
            const subject = { subject_id: 'sub-1' };
            const explicitQual = { instructor_subject_id: 'qual-1' };

            const dbClient = {
                selectFrom: vi.fn().mockImplementation((table) => {
                    if (table === 'instructors') return createSelectBuilder(instructor);
                    if (table === 'subjects') return createSelectBuilder(subject);
                    if (table === 'instructor_subjects') return createSelectBuilder(explicitQual);
                    return createSelectBuilder(undefined);
                }),
            } as any;

            await expect(
                InstructorSubjectRequestsService.submitRequest(dbClient, {
                    instructorUserId: 'user-1',
                    subjectId: 'sub-1',
                    institutionId: 'inst-1',
                }),
            ).rejects.toMatchObject({
                status: 409,
                message: 'You are already qualified for this subject.',
            });
        });
    });

    describe('reviewRequest', () => {
        it('successfully approves a pending request and inserts explicit qualification', async () => {
            const request = {
                request_id: 'req-1',
                instructor_id: 'ins-1',
                subject_id: 'sub-1',
                status: 'PENDING',
                institution_id: 'inst-1',
            };

            const updatedRequest = {
                ...request,
                status: 'APPROVED',
            };

            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(request)),
            } as any;

            vi.mocked(executeTransaction).mockImplementation(async (callback: any) => {
                const trx = {
                    updateTable: vi.fn().mockReturnValue({
                        set: vi.fn().mockReturnThis(),
                        where: vi.fn().mockReturnThis(),
                        execute: vi.fn().mockResolvedValue(undefined),
                    }),
                    insertInto: vi.fn().mockReturnValue({
                        values: vi.fn().mockReturnThis(),
                        onConflict: vi.fn().mockReturnThis(),
                        execute: vi.fn().mockResolvedValue(undefined),
                    }),
                    selectFrom: vi.fn().mockReturnValue(createSelectBuilder(updatedRequest)),
                } as any;

                return await callback(trx);
            });

            const result = await InstructorSubjectRequestsService.reviewRequest(dbClient, {
                requestId: 'req-1',
                status: 'APPROVED',
                reviewerUserId: 'admin-1',
                reviewComments: 'Approved!',
                institutionId: 'inst-1',
            });

            expect(result).toMatchObject({
                status: 'APPROVED',
            });
            expect(executeTransaction).toHaveBeenCalled();
        });
    });
});
