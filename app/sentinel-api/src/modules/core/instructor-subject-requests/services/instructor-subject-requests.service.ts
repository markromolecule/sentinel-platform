import { type DbClient, executeTransaction } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { NotificationService } from '../../../general/notification/notification.service';
import { LogsService } from '../../../general/logs/logs.service';

export class InstructorSubjectRequestsService {
    /**
     * Submits a new subject qualification request.
     */
    static async submitRequest(
        dbClient: DbClient,
        args: {
            instructorUserId: string;
            subjectId: string;
            justification?: string;
            institutionId: string;
        },
    ) {
        const { instructorUserId, subjectId, justification, institutionId } = args;
        const trxOrDb = dbClient;

        // 1. Get instructor_id
        const instructor = await trxOrDb
            .selectFrom('instructors')
            .select(['instructor_id', 'institution_id'])
            .where('user_id', '=', instructorUserId)
            .executeTakeFirst();

        if (!instructor) {
            throw new HTTPException(404, {
                message: 'Instructor record not found.',
            });
        }

        if (instructor.institution_id !== institutionId) {
            throw new HTTPException(403, {
                message: 'Unauthorized. Subject belongs to a different institution.',
            });
        }

        // 2. Verify subject exists
        const subject = await trxOrDb
            .selectFrom('subjects')
            .select(['subject_id', 'subject_code', 'subject_title'])
            .where('subject_id', '=', subjectId)
            .where('institution_id', '=', institutionId)
            .executeTakeFirst();

        if (!subject) {
            throw new HTTPException(404, {
                message: 'Subject not found in your institution.',
            });
        }

        // 3. Check if already qualified
        const existingQual = await trxOrDb
            .selectFrom('instructor_subjects')
            .select('instructor_subject_id')
            .where('instructor_id', '=', instructor.instructor_id)
            .where('subject_id', '=', subjectId)
            .executeTakeFirst();

        if (existingQual) {
            throw new HTTPException(409, {
                message: 'You are already qualified for this subject.',
            });
        }

        // 4. Check if pending request already exists
        const existingPending = await trxOrDb
            .selectFrom('instructor_subject_requests')
            .select('request_id')
            .where('instructor_id', '=', instructor.instructor_id)
            .where('subject_id', '=', subjectId)
            .where('status', '=', 'PENDING')
            .executeTakeFirst();

        if (existingPending) {
            throw new HTTPException(409, {
                message: 'A pending request for this subject already exists.',
            });
        }

        // 5. Insert request
        const request = await trxOrDb
            .insertInto('instructor_subject_requests')
            .values({
                instructor_id: instructor.instructor_id,
                subject_id: subjectId,
                status: 'PENDING',
                justification: justification || null,
                updated_at: new Date(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        const created = await this.getRequestById(trxOrDb, request.request_id);

        // Audit log the submission
        try {
            await LogsService.createLog(trxOrDb, {
                userId: instructorUserId,
                action: 'instructor_subject_request.submitted',
                resourceType: 'instructor_subject_request',
                resourceId: request.request_id,
                activeInstitutionId: institutionId,
                details: {
                    requestId: request.request_id,
                    subjectId,
                    subjectCode: subject.subject_code,
                    subjectTitle: subject.subject_title,
                    justification: justification ?? null,
                },
            });
        } catch (logErr) {
            console.error('Failed to log instructor_subject_request.submitted:', logErr);
        }

        return created;
    }

    /**
     * Reviews a pending request (APPROVED, REJECTED, WAITLISTED).
     */
    static async reviewRequest(
        dbClient: DbClient,
        args: {
            requestId: string;
            status: 'APPROVED' | 'REJECTED' | 'WAITLISTED';
            reviewerUserId: string;
            reviewComments?: string;
            institutionId: string;
        },
    ) {
        const { requestId, status, reviewerUserId, reviewComments, institutionId } = args;
        const trxOrDb = dbClient;

        const request = await trxOrDb
            .selectFrom('instructor_subject_requests as isr')
            .innerJoin('instructors as ins', 'ins.instructor_id', 'isr.instructor_id')
            .select(['isr.request_id', 'isr.instructor_id', 'isr.subject_id', 'isr.status', 'ins.institution_id'])
            .where('isr.request_id', '=', requestId)
            .executeTakeFirst();

        if (!request) {
            throw new HTTPException(404, {
                message: 'Subject request not found.',
            });
        }

        if (request.institution_id !== institutionId) {
            throw new HTTPException(403, {
                message: 'Forbidden. Request belongs to a different institution.',
            });
        }

        if (request.status !== 'PENDING') {
            throw new HTTPException(400, {
                message: `Cannot review request with current status: ${request.status}`,
            });
        }

        const result = await executeTransaction(async (trx) => {
            // Update request
            await trx
                .updateTable('instructor_subject_requests')
                .set({
                    status,
                    reviewer_user_id: reviewerUserId,
                    reviewed_at: new Date(),
                    review_comments: reviewComments || null,
                    updated_at: new Date(),
                })
                .where('request_id', '=', requestId)
                .execute();

            // If APPROVED, auto-insert into explicit qualifications
            if (status === 'APPROVED') {
                await trx
                    .insertInto('instructor_subjects')
                    .values({
                        instructor_id: request.instructor_id,
                        subject_id: request.subject_id,
                        assigned_by_user_id: reviewerUserId,
                        updated_at: new Date(),
                    })
                    .onConflict((oc) =>
                        oc.columns(['instructor_id', 'subject_id']).doUpdateSet({
                            assigned_by_user_id: reviewerUserId,
                            updated_at: new Date(),
                        }),
                    )
                    .execute();
            }

            return await this.getRequestById(trx, requestId);
        });

        // Resolve instructor user_id and reviewer name for notification
        const instructorUser = await dbClient
            .selectFrom('instructors')
            .select('user_id')
            .where('instructor_id', '=', request.instructor_id)
            .executeTakeFirst();

        const reviewerProfile = await dbClient
            .selectFrom('user_profiles')
            .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('name')])
            .where('user_id', '=', reviewerUserId)
            .executeTakeFirst();

        const subjectRecord = await dbClient
            .selectFrom('subjects')
            .select(['subject_title', 'subject_code'])
            .where('subject_id', '=', request.subject_id)
            .executeTakeFirst();

        const reviewerName = reviewerProfile?.name ?? 'Admin';
        const subjectTitle = subjectRecord?.subject_title ?? subjectRecord?.subject_code ?? 'Subject';

        if (instructorUser?.user_id) {
            try {
                if (status === 'APPROVED') {
                    await NotificationService.notifyInstructorSubjectRequestApproved({
                        dbClient,
                        recipientUserId: instructorUser.user_id,
                        actorUserId: reviewerUserId,
                        institutionId,
                        requestId,
                        subjectTitle,
                        reviewerName,
                    });
                } else if (status === 'REJECTED') {
                    await NotificationService.notifyInstructorSubjectRequestRejected({
                        dbClient,
                        recipientUserId: instructorUser.user_id,
                        actorUserId: reviewerUserId,
                        institutionId,
                        requestId,
                        subjectTitle,
                        reviewerName,
                        reviewComments: reviewComments ?? null,
                    });
                }
            } catch (notifErr) {
                console.error('Failed to send subject request review notification:', notifErr);
            }
        }

        // Audit log the review action
        try {
            await LogsService.createLog(dbClient, {
                userId: reviewerUserId,
                action: `instructor_subject_request.${status.toLowerCase()}`,
                resourceType: 'instructor_subject_request',
                resourceId: requestId,
                activeInstitutionId: institutionId,
                details: {
                    requestId,
                    status,
                    subjectTitle,
                    reviewComments: reviewComments ?? null,
                },
            });
        } catch (logErr) {
            console.error('Failed to log instructor_subject_request review:', logErr);
        }

        return result;
    }

    /**
     * Cancels a pending request.
     */
    static async cancelRequest(
        dbClient: DbClient,
        args: {
            requestId: string;
            instructorUserId: string;
        },
    ) {
        const { requestId, instructorUserId } = args;
        const trxOrDb = dbClient;

        const request = await trxOrDb
            .selectFrom('instructor_subject_requests as isr')
            .innerJoin('instructors as ins', 'ins.instructor_id', 'isr.instructor_id')
            .select(['isr.request_id', 'isr.status', 'ins.user_id'])
            .where('isr.request_id', '=', requestId)
            .executeTakeFirst();

        if (!request) {
            throw new HTTPException(404, {
                message: 'Subject request not found.',
            });
        }

        if (request.user_id !== instructorUserId) {
            throw new HTTPException(403, {
                message: 'Forbidden. You can only cancel your own requests.',
            });
        }

        if (request.status !== 'PENDING') {
            throw new HTTPException(400, {
                message: `Cannot cancel request with current status: ${request.status}`,
            });
        }

        await trxOrDb
            .updateTable('instructor_subject_requests')
            .set({
                status: 'CANCELLED',
                updated_at: new Date(),
            })
            .where('request_id', '=', requestId)
            .execute();
    }

    /**
     * Lists subject requests with filters.
     */
    static async listRequests(
        dbClient: DbClient,
        args: {
            instructorUserId?: string;
            status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
            institutionId: string;
        },
    ) {
        const { instructorUserId, status, institutionId } = args;
        const trxOrDb = dbClient;

        let query = trxOrDb
            .selectFrom('instructor_subject_requests as isr')
            .innerJoin('instructors as ins', 'ins.instructor_id', 'isr.instructor_id')
            .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
            .innerJoin('subjects as s', 's.subject_id', 'isr.subject_id')
            .leftJoin('user_profiles as rp', 'rp.user_id', 'isr.reviewer_user_id')
            .select([
                'isr.request_id',
                'isr.instructor_id',
                'ins.user_id as instructor_user_id',
                sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('instructor_name'),
                'isr.subject_id',
                's.subject_code',
                's.subject_title',
                'isr.status',
                'isr.justification',
                'isr.reviewer_user_id',
                sql<string | null>`trim(concat(rp.first_name, ' ', rp.last_name))`.as('reviewer_name'),
                'isr.reviewed_at',
                'isr.review_comments',
                'isr.created_at',
                'isr.updated_at',
            ])
            .where('ins.institution_id', '=', institutionId);

        if (instructorUserId) {
            query = query.where('ins.user_id', '=', instructorUserId);
        }

        if (status) {
            query = query.where('isr.status', '=', status);
        }

        const requests = await query.orderBy('isr.created_at', 'desc').execute();

        return requests.map((req) => ({
            ...req,
            created_at: req.created_at ? new Date(req.created_at).toISOString() : null,
            updated_at: req.updated_at ? new Date(req.updated_at).toISOString() : null,
            reviewed_at: req.reviewed_at ? new Date(req.reviewed_at).toISOString() : null,
        }));
    }

    /**
     * Gets a single request by ID.
     */
    static async getRequestById(dbClient: DbClient, requestId: string) {
        const req = await dbClient
            .selectFrom('instructor_subject_requests as isr')
            .innerJoin('instructors as ins', 'ins.instructor_id', 'isr.instructor_id')
            .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
            .innerJoin('subjects as s', 's.subject_id', 'isr.subject_id')
            .leftJoin('user_profiles as rp', 'rp.user_id', 'isr.reviewer_user_id')
            .select([
                'isr.request_id',
                'isr.instructor_id',
                'ins.user_id as instructor_user_id',
                sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('instructor_name'),
                'isr.subject_id',
                's.subject_code',
                's.subject_title',
                'isr.status',
                'isr.justification',
                'isr.reviewer_user_id',
                sql<string | null>`trim(concat(rp.first_name, ' ', rp.last_name))`.as('reviewer_name'),
                'isr.reviewed_at',
                'isr.review_comments',
                'isr.created_at',
                'isr.updated_at',
            ])
            .where('isr.request_id', '=', requestId)
            .executeTakeFirst();

        if (!req) return null;

        return {
            ...req,
            created_at: req.created_at ? new Date(req.created_at).toISOString() : null,
            updated_at: req.updated_at ? new Date(req.updated_at).toISOString() : null,
            reviewed_at: req.reviewed_at ? new Date(req.reviewed_at).toISOString() : null,
        };
    }
}
