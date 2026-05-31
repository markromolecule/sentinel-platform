import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { assignInstructorToClassroom } from './classroom-instructor-management.service';

export class ClassroomAssignmentDashboardService {
    /**
     * Finds configured classrooms in the institution that do not have a head instructor.
     */
    static async getUnassignedClassrooms(dbClient: DbClient, institutionId: string) {
        const results = await dbClient
            .selectFrom('class_groups as cg')
            .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
            .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
            .select([
                'cg.class_group_id',
                'cg.class_name',
                'cg.subject_id',
                's.subject_code',
                's.subject_title',
                'cg.section_id',
                'sec.section_name',
                'cg.term_id',
            ])
            .where('cg.institution_id', '=', institutionId)
            .where((eb) =>
                eb.not(
                    eb.exists(
                        eb
                            .selectFrom('classroom_instructor_assignments as cia')
                            .select('cia.assignment_id')
                            .whereRef('cia.class_group_id', '=', 'cg.class_group_id')
                            .where('cia.is_head', '=', true),
                    ),
                ),
            )
            .orderBy('cg.class_name', 'asc')
            .execute();

        return results;
    }

    /**
     * Fetches current term classroom workload load details for instructors in the institution.
     */
    static async getInstructorLoadSummary(
        dbClient: DbClient,
        args: { institutionId: string; termId?: string },
    ) {
        const { institutionId, termId } = args;

        let countQuery = dbClient
            .selectFrom('classroom_instructor_assignments as cia')
            .innerJoin('class_groups as cg', 'cg.class_group_id', 'cia.class_group_id')
            .select(['cia.instructor_user_id', sql<number>`count(cia.assignment_id)::int`.as('load_count')])
            .where('cg.institution_id', '=', institutionId)
            .where('cia.status', '=', 'ACTIVE');

        if (termId) {
            countQuery = countQuery.where('cg.term_id', '=', termId);
        }

        const counts = await countQuery.groupBy('cia.instructor_user_id').execute();
        const countMap = new Map(counts.map((c) => [c.instructor_user_id, c.load_count]));

        const instructors = await dbClient
            .selectFrom('instructors as ins')
            .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
            .leftJoin('departments as dep', 'dep.department_id', 'ins.department_id')
            .select([
                'ins.instructor_id',
                'ins.user_id',
                'ins.employee_number',
                sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
                'dep.department_name',
            ])
            .where('ins.institution_id', '=', institutionId)
            .orderBy('name', 'asc')
            .execute();

        return instructors.map((ins) => ({
            ...ins,
            classroom_count: countMap.get(ins.user_id as string) || 0,
        }));
    }

    /**
     * Recommends qualified instructors for a classroom, factoring in qualifications, active workload, and preferences.
     */
    static async getSmartSuggestions(
        dbClient: DbClient,
        args: { classGroupId: string; institutionId: string },
    ) {
        const { classGroupId, institutionId } = args;

        const classroom = await dbClient
            .selectFrom('class_groups')
            .select(['subject_id', 'term_id'])
            .where('class_group_id', '=', classGroupId)
            .executeTakeFirst();

        if (!classroom || !classroom.subject_id) {
            return [];
        }

        const subjectId = classroom.subject_id;
        const termId = classroom.term_id;

        const explicitSub = dbClient
            .selectFrom('instructor_subjects')
            .select(['instructor_id', sql<string>`'explicit'`.as('qualification_type')])
            .where('subject_id', '=', subjectId);

        const derivedSub = dbClient
            .selectFrom('instructor_courses as ic')
            .innerJoin('course_subjects as cs', 'cs.course_id', 'ic.course_id')
            .select(['ic.instructor_id', sql<string>`'derived'`.as('qualification_type')])
            .where('cs.subject_id', '=', subjectId);

        const qualifiedUnion = dbClient
            .selectFrom(
                explicitSub.unionAll(derivedSub).as('uq')
            )
            .select(['uq.instructor_id', sql<string>`min(uq.qualification_type)`.as('qualification_type')])
            .groupBy('uq.instructor_id');

        let loadSub = dbClient
            .selectFrom('classroom_instructor_assignments as cia')
            .innerJoin('class_groups as cg', 'cg.class_group_id', 'cia.class_group_id')
            .select(['cia.instructor_user_id', sql<number>`count(cia.assignment_id)::int`.as('load_count')])
            .where('cg.institution_id', '=', institutionId)
            .where('cia.status', '=', 'ACTIVE');

        if (termId) {
            loadSub = loadSub.where('cg.term_id', '=', termId);
        }
        const loadQuery = loadSub.groupBy('cia.instructor_user_id');

        const suggestions = await dbClient
            .selectFrom(qualifiedUnion.as('qu'))
            .innerJoin('instructors as ins', 'ins.instructor_id', 'qu.instructor_id')
            .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
            .leftJoin('instructor_subject_requests as isr', (join) =>
                join
                    .onRef('isr.instructor_id', '=', 'ins.instructor_id')
                    .on('isr.subject_id', '=', subjectId),
            )
            .leftJoin(loadQuery.as('l'), 'l.instructor_user_id', 'ins.user_id')
            .select([
                'ins.instructor_id',
                'ins.user_id',
                'ins.employee_number',
                sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
                'qu.qualification_type',
                sql<number>`coalesce(l.load_count, 0)`.as('classroom_count'),
                'isr.status as request_status',
                'isr.justification as request_justification',
            ])
            .orderBy('qualification_type', 'asc')
            .orderBy('classroom_count', 'asc')
            .execute();

        return suggestions;
    }

    /**
     * Executes bulk assignments for multiple classrooms.
     */
    static async bulkAssignInstructors(
        dbClient: DbClient,
        args: {
            assignments: Array<{ classGroupId: string; instructorUserId: string }>;
            actorUserId: string;
            institutionId: string;
        },
    ) {
        const { assignments, actorUserId, institutionId } = args;

        const results = [];
        for (const assignment of assignments) {
            try {
                await assignInstructorToClassroom({
                    dbClient,
                    classGroupId: assignment.classGroupId,
                    instructorUserId: assignment.instructorUserId,
                    actorUserId,
                    institutionId,
                });
                results.push({
                    classGroupId: assignment.classGroupId,
                    instructorUserId: assignment.instructorUserId,
                    success: true,
                });
            } catch (error: any) {
                results.push({
                    classGroupId: assignment.classGroupId,
                    instructorUserId: assignment.instructorUserId,
                    success: false,
                    error: error.message || 'Failed to assign instructor.',
                });
            }
        }

        return results;
    }
}
