import { sql } from 'kysely';
import { type DbClient } from '@sentinel/db';

export class EntitlementsRepository {
    /**
     * Looks up the student profile linked to the authenticated user.
     */
    static async getStudentProfileByUserId(db: DbClient, userId: string) {
        return await db
            .selectFrom('students')
            .select(['student_id', 'institution_id'])
            .where('user_id', '=', userId)
            .executeTakeFirst();
    }

    /**
     * Resolves the exam access policy surface used by the access boundary.
     */
    static async getExamAccessPolicy(db: DbClient, examId: string) {
        return await db
            .selectFrom('exams as e')
            .leftJoin('rooms as r', 'r.room_id', 'e.room_id')
            .leftJoin('exam_configurations as ec', 'ec.exam_id', 'e.exam_id')
            .select([
                'e.exam_id',
                'e.title',
                'e.class_group_id',
                'e.subject_id',
                'e.section_id',
                'e.room_id',
                'e.duration_minutes',
                'e.scheduled_date',
                'e.end_date_time',
                'e.status',
                'e.published_at',
                'e.institution_id',
                'ec.lobby_admission_mode as lobby_admission_mode',
                'ec.max_reconnect_attempts as max_reconnect_attempts',
                'r.room_id as assigned_room_id',
                'r.institution_id as room_institution_id',
                (eb) =>
                    eb
                        .selectFrom('exam_assigned_sections as eas')
                        .select(sql<string[]>`array_agg(eas.section_id)`.as('section_ids'))
                        .whereRef('eas.exam_id', '=', 'e.exam_id')
                        .as('assigned_section_ids'),
            ])
            .where('e.exam_id', '=', examId)
            .executeTakeFirst();
    }

    /**
     * Checks whether the student is enrolled in the subject and, when present,
     * the section targeted by the exam.
     */
    static async hasStudentExamEnrollment(
        db: DbClient,
        args: {
            studentId: string;
            classGroupId?: string | null;
            subjectId: string;
            sectionId?: string | null;
            sectionIds?: string[] | null;
        },
    ): Promise<boolean> {
        const { studentId, classGroupId, subjectId, sectionId, sectionIds } = args;
        const explicitSectionIds =
            sectionIds && sectionIds.length > 0
                ? sectionIds
                : classGroupId
                  ? []
                  : [sectionId].filter((value): value is string => Boolean(value));

        if (classGroupId) {
            const directEnrollment = await db
                .selectFrom('enrollments as e')
                .select('e.enrollment_id')
                .where('e.student_id', '=', studentId)
                .where('e.class_group_id', '=', classGroupId)
                .executeTakeFirst();

            if (directEnrollment) {
                return true;
            }

            if (explicitSectionIds.length === 0) {
                return false;
            }
        }

        let query = db
            .selectFrom('enrollments as e')
            .innerJoin('class_groups as cg', 'cg.class_group_id', 'e.class_group_id')
            .innerJoin(
                'subject_offerings as so',
                'so.subject_offering_id',
                'cg.subject_offering_id',
            )
            .select('e.enrollment_id')
            .where('e.student_id', '=', studentId)
            .where('so.subject_id', '=', subjectId);

        if (explicitSectionIds.length > 0) {
            query = query.where('cg.section_id', 'in', explicitSectionIds);
        }

        const enrollment = await query.executeTakeFirst();

        return Boolean(enrollment);
    }

    static async getStudentLatestExamAttempt(
        db: DbClient,
        args: {
            studentId: string;
            examId: string;
        },
    ) {
        return await db
            .selectFrom('exam_attempts as ea')
            .select([
                'ea.attempt_id',
                'ea.status',
                'ea.completed_at',
                'ea.started_at',
                'ea.reconnect_attempt_count',
            ])
            .where('ea.student_id', '=', args.studentId)
            .where('ea.exam_id', '=', args.examId)
            .orderBy('ea.created_at', 'desc')
            .executeTakeFirst();
    }

    static async getStudentLatestLobbyAdmission(
        db: DbClient,
        args: {
            studentId: string;
            examId: string;
        },
    ) {
        return await db
            .selectFrom('exam_lobby_admissions')
            .select(['admission_id', 'status', 'checked_in_at', 'decided_at'])
            .where('student_id', '=', args.studentId)
            .where('exam_id', '=', args.examId)
            .orderBy('checked_in_at', 'desc')
            .executeTakeFirst();
    }
}
