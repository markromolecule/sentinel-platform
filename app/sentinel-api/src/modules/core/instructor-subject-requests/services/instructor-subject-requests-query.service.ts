import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

/**
 * Lists subject requests with filters.
 */
export async function listRequests(
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
export async function getRequestById(dbClient: DbClient, requestId: string) {
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
