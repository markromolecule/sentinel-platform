import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { buildInstructorExamVisibilityPredicates } from '../../assign/services/exam-access';
import type { AssessmentAllowedRole } from '../../assessment/assessment-access';

export type ReportingExamContext = {
    examId: string;
    title: string;
    subject: string;
    scheduledDate: string | null;
    endDateTime: string | null;
    durationMinutes: number;
    passingScore: number;
    classGroupId: string | null;
    subjectId: string;
    sectionId: string | null;
    assignedSectionIds: string[];
};

type GetReportingExamContextArgs = {
    dbClient: DbClient;
    examId: string;
    institutionId?: string;
    viewerRole: AssessmentAllowedRole;
    userId?: string | null;
};

export async function getReportingExamContext({
    dbClient,
    examId,
    institutionId,
    viewerRole,
    userId,
}: GetReportingExamContextArgs): Promise<ReportingExamContext> {
    let query = dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .select([
            'e.exam_id',
            'e.title',
            'e.class_group_id',
            'e.subject_id',
            'e.section_id',
            'e.duration_minutes',
            'e.passing_score',
            'e.scheduled_date',
            'e.end_date_time',
            's.subject_title',
            (eb) =>
                eb
                    .selectFrom('exam_assigned_sections as eas')
                    .select(sql<string[]>`array_agg(eas.section_id)`.as('section_ids'))
                    .whereRef('eas.exam_id', '=', 'e.exam_id')
                    .as('assigned_section_ids'),
        ])
        .where('e.exam_id', '=', examId);

    if (institutionId) {
        query = query.where('e.institution_id', '=', institutionId);
    }

    if (viewerRole === 'instructor' && userId) {
        const visibilityPredicates = await buildInstructorExamVisibilityPredicates({
            dbClient,
            userId,
        });
        query = query.where(sql<boolean>`(${sql.join(visibilityPredicates, sql` or `)})`);
    }

    const exam = await query.executeTakeFirst();

    if (!exam || !exam.subject_id) {
        throw new HTTPException(404, {
            message: 'Exam report record not found.',
        });
    }

    return {
        examId: exam.exam_id,
        title: exam.title,
        subject: exam.subject_title ?? 'Untitled Subject',
        scheduledDate: exam.scheduled_date ? new Date(exam.scheduled_date).toISOString() : null,
        endDateTime: exam.end_date_time ? new Date(exam.end_date_time).toISOString() : null,
        durationMinutes: exam.duration_minutes ?? 0,
        passingScore: exam.passing_score ?? 0,
        classGroupId: exam.class_group_id ?? null,
        subjectId: exam.subject_id,
        sectionId: exam.section_id ?? null,
        assignedSectionIds: exam.assigned_section_ids ?? [],
    };
}
