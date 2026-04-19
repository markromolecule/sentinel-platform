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
            .select([
                'e.exam_id',
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

        if (classGroupId) {
            const directEnrollment = await db
                .selectFrom('enrollments as e')
                .select('e.enrollment_id')
                .where('e.student_id', '=', studentId)
                .where('e.class_group_id', '=', classGroupId)
                .executeTakeFirst();

            return Boolean(directEnrollment);
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

        if (sectionId) {
            query = query.where('cg.section_id', '=', sectionId);
        } else if (sectionIds && sectionIds.length > 0) {
            query = query.where('cg.section_id', 'in', sectionIds);
        }

        const enrollment = await query.executeTakeFirst();

        return Boolean(enrollment);
    }
}
