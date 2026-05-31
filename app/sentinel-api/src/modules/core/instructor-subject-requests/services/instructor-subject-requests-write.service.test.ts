import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import {
    submitRequest,
    reviewRequest,
    cancelRequest,
} from './instructor-subject-requests-write.service';
import { executeTransaction } from '@sentinel/db';
import { NotificationService } from '../../../general/notification/notification.service';
import { LogsService } from '../../../general/logs/logs.service';

vi.mock('../../../general/notification/notification.service', () => ({
    NotificationService: {
        notifyInstructorSubjectRequestApproved: vi.fn().mockResolvedValue(undefined),
        notifyInstructorSubjectRequestRejected: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock('../../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock('@sentinel/db', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@sentinel/db')>();
    return {
        ...actual,
        executeTransaction: vi.fn().mockImplementation(async (fn: any) => fn(mockTrx)),
    };
});

const mockTrx = {
    updateTable: vi.fn(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
    })),
    insertInto: vi.fn(() => ({
        values: vi.fn().mockReturnThis(),
        onConflict: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
    })),
    selectFrom: vi.fn(() => ({
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(null),
    })),
} as any;

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

function makeReviewDbClient({
    request = {
        request_id: 'req-1',
        instructor_id: 'ins-1',
        subject_id: 'subj-1',
        status: 'PENDING',
        institution_id: 'inst-1',
    },
    instructorUser = { user_id: 'user-inst-1' },
    reviewerProfile = { name: 'Dr. Rivera' },
    subjectRecord = { subject_title: 'Advanced Calculus', subject_code: 'MATH401' },
}: {
    request?: any;
    instructorUser?: any | null;
    reviewerProfile?: any;
    subjectRecord?: any;
} = {}) {
    let postTrxCallCount = 0;
    const postTrxSelectFrom = vi.fn(() => {
        postTrxCallCount++;
        const call = postTrxCallCount;
        return {
            select: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn().mockImplementation(() => {
                if (call === 1) return Promise.resolve(instructorUser);
                if (call === 2) return Promise.resolve(reviewerProfile);
                if (call === 3) return Promise.resolve(subjectRecord);
                return Promise.resolve(null);
            }),
        };
    });

    let preTrxCallCount = 0;
    const selectFrom = vi.fn().mockImplementation(() => {
        preTrxCallCount++;
        if (preTrxCallCount === 1) {
            return {
                innerJoin: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                executeTakeFirst: vi.fn().mockResolvedValue(request),
            };
        }
        return postTrxSelectFrom();
    });

    return { selectFrom } as any;
}

describe('instructor subject requests write service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockTrx.selectFrom.mockReturnValue({
            innerJoin: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn().mockResolvedValue({
                request_id: 'req-1',
                instructor_id: 'ins-1',
                subject_id: 'subj-1',
                status: 'PENDING',
                subject_code: 'MATH401',
                subject_title: 'Advanced Calculus',
                instructor_name: 'Ana Reyes',
                instructor_user_id: 'user-inst-1',
                reviewer_user_id: null,
                reviewer_name: null,
                review_comments: null,
                reviewed_at: null,
                justification: null,
                created_at: new Date(),
                updated_at: new Date(),
            }),
        });
    });

    describe('submitRequest', () => {
        it('throws 404 if instructor not found', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(undefined)),
            } as any;

            await expect(
                submitRequest(dbClient, {
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
                submitRequest(dbClient, {
                    instructorUserId: 'user-1',
                    subjectId: 'sub-1',
                    institutionId: 'inst-1',
                }),
            ).rejects.toMatchObject({
                status: 409,
                message: 'You are already qualified for this subject.',
            });
        });

        it('writes an audit log after successful submission', async () => {
            const requestId = 'req-new-1';
            const insertReturning = {
                request_id: requestId,
                instructor_id: 'ins-1',
                subject_id: 'subj-2',
                status: 'PENDING',
                justification: 'Teaching this subject for 5 years.',
                updated_at: new Date(),
            };

            let selectCallCount = 0;
            const dbClient = {
                selectFrom: vi.fn().mockImplementation(() => {
                    selectCallCount++;
                    const call = selectCallCount;
                    return {
                        select: vi.fn().mockReturnThis(),
                        innerJoin: vi.fn().mockReturnThis(),
                        leftJoin: vi.fn().mockReturnThis(),
                        where: vi.fn().mockReturnThis(),
                        orderBy: vi.fn().mockReturnThis(),
                        executeTakeFirst: vi.fn().mockImplementation(() => {
                            if (call === 1)
                                return Promise.resolve({
                                    instructor_id: 'ins-1',
                                    institution_id: 'inst-1',
                                });
                            if (call === 2)
                                return Promise.resolve({
                                    subject_id: 'subj-2',
                                    subject_code: 'CALC201',
                                    subject_title: 'Calculus II',
                                });
                            if (call === 3) return Promise.resolve(null);
                            if (call === 4) return Promise.resolve(null);
                            return Promise.resolve({
                                ...insertReturning,
                                instructor_name: 'Ana Reyes',
                                instructor_user_id: 'user-inst-1',
                                subject_code: 'CALC201',
                                subject_title: 'Calculus II',
                                reviewer_user_id: null,
                                reviewer_name: null,
                                review_comments: null,
                                reviewed_at: null,
                                created_at: new Date(),
                                updated_at: new Date(),
                            });
                        }),
                    };
                }),
                insertInto: vi.fn().mockImplementation(() => ({
                    values: vi.fn().mockReturnThis(),
                    returningAll: vi.fn().mockReturnThis(),
                    executeTakeFirstOrThrow: vi.fn().mockResolvedValue(insertReturning),
                })),
            } as any;

            await submitRequest(dbClient, {
                instructorUserId: 'user-inst-1',
                subjectId: 'subj-2',
                institutionId: 'inst-1',
                justification: 'Teaching this subject for 5 years.',
            });

            expect(LogsService.createLog).toHaveBeenCalledWith(
                dbClient,
                expect.objectContaining({
                    action: 'instructor_subject_request.submitted',
                    resourceType: 'instructor_subject_request',
                    activeInstitutionId: 'inst-1',
                    details: expect.objectContaining({
                        subjectId: 'subj-2',
                        justification: 'Teaching this subject for 5 years.',
                    }),
                }),
            );
        });
    });

    describe('reviewRequest', () => {
        it('sends an approval notification to the instructor when request is APPROVED', async () => {
            const dbClient = makeReviewDbClient();

            await reviewRequest(dbClient, {
                requestId: 'req-1',
                status: 'APPROVED',
                reviewerUserId: 'reviewer-1',
                institutionId: 'inst-1',
            });

            expect(
                NotificationService.notifyInstructorSubjectRequestApproved,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    dbClient,
                    recipientUserId: 'user-inst-1',
                    actorUserId: 'reviewer-1',
                    requestId: 'req-1',
                    reviewerName: 'Dr. Rivera',
                    subjectTitle: 'Advanced Calculus',
                    institutionId: 'inst-1',
                }),
            );
        });

        it('sends a rejection notification when request is REJECTED', async () => {
            const dbClient = makeReviewDbClient();

            await reviewRequest(dbClient, {
                requestId: 'req-1',
                status: 'REJECTED',
                reviewerUserId: 'reviewer-1',
                reviewComments: 'Insufficient credentials.',
                institutionId: 'inst-1',
            });

            expect(
                NotificationService.notifyInstructorSubjectRequestRejected,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    dbClient,
                    recipientUserId: 'user-inst-1',
                    actorUserId: 'reviewer-1',
                    requestId: 'req-1',
                    reviewerName: 'Dr. Rivera',
                    subjectTitle: 'Advanced Calculus',
                    reviewComments: 'Insufficient credentials.',
                }),
            );
        });

        it('writes an audit log with the review action', async () => {
            const dbClient = makeReviewDbClient();

            await reviewRequest(dbClient, {
                requestId: 'req-1',
                status: 'APPROVED',
                reviewerUserId: 'reviewer-1',
                reviewComments: 'Well qualified.',
                institutionId: 'inst-1',
            });

            expect(LogsService.createLog).toHaveBeenCalledWith(
                dbClient,
                expect.objectContaining({
                    action: 'instructor_subject_request.approved',
                    resourceType: 'instructor_subject_request',
                    resourceId: 'req-1',
                    activeInstitutionId: 'inst-1',
                }),
            );
        });
    });
});
