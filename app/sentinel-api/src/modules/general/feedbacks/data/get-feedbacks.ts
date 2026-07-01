import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetFeedbacksQuery } from '@sentinel/shared/schema';

const FEEDBACK_SORT_COLUMN_MAP = {
    createdAt: 'ef.created_at',
    rating: 'ef.rating',
    studentName: 'studentName',
    examTitle: 'e.title',
} as const;

export async function getFeedbacksData(
    dbClient: DbClient,
    args: GetFeedbacksQuery & {
        institutionId?: string;
        canViewAllInstitutions?: boolean;
    },
) {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 10;
    const offset = (page - 1) * pageSize;
    const sortBy = args.sortBy ?? 'createdAt';
    const sortOrder = args.sortOrder ?? 'desc';

    const studentNameExpression = sql<
        string | null
    >`nullif(trim(concat_ws(' ', up.first_name, up.last_name)), '')`;
    const studentEmailExpression = sql<
        string | null
    >`(select u.email from users as u where u.id = s.user_id limit 1)`;

    let baseQuery = dbClient
        .selectFrom('exam_feedbacks as ef')
        .leftJoin('exams as e', 'e.exam_id', 'ef.exam_id')
        .leftJoin('students as s', 's.student_id', 'ef.student_id')
        .leftJoin('user_profiles as up', 'up.user_id', 's.user_id')
        .leftJoin('institutions as i', 'i.id', 'ef.institution_id');

    if (!args.canViewAllInstitutions && args.institutionId) {
        baseQuery = baseQuery.where('ef.institution_id', '=', args.institutionId);
    }

    if (args.rating) {
        baseQuery = baseQuery.where('ef.rating', '=', args.rating);
    }

    if (args.examId) {
        baseQuery = baseQuery.where('ef.exam_id', '=', args.examId);
    }

    if (args.search) {
        const pattern = `%${args.search}%`;
        baseQuery = baseQuery.where((eb) =>
            eb.or([
                eb(studentNameExpression, 'ilike', pattern),
                eb(studentEmailExpression, 'ilike', pattern),
                eb('s.student_number', 'ilike', pattern),
                eb('e.title', 'ilike', pattern),
                eb('i.name', 'ilike', pattern),
                eb('ef.experience', 'ilike', pattern),
            ]),
        );
    }

    const countResult = await baseQuery
        .select(sql<number>`count(*)`.as('count'))
        .executeTakeFirst();

    const total = Number(countResult?.count ?? 0);
    const sortColumn = FEEDBACK_SORT_COLUMN_MAP[sortBy];

    const items = await baseQuery
        .select([
            'ef.feedback_id as feedbackId',
            'ef.attempt_id as attemptId',
            'ef.exam_id as examId',
            'ef.student_id as studentId',
            'ef.institution_id as institutionId',
            'ef.rating',
            'ef.experience',
            'ef.created_at as createdAt',
            'ef.updated_at as updatedAt',
            'e.title as examTitle',
            's.user_id as studentUserId',
            's.student_number as studentNumber',
            'i.name as institutionName',
            studentEmailExpression.as('studentEmail'),
            studentNameExpression.as('studentName'),
        ])
        .orderBy(sortColumn as any, sortOrder)
        .orderBy('ef.feedback_id', 'desc')
        .limit(pageSize)
        .offset(offset)
        .execute();

    return {
        items,
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        hasMore: offset + items.length < total,
    };
}
