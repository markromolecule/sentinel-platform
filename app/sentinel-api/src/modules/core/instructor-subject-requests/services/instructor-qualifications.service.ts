import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { LogsService } from '../../../general/logs/logs.service';

export class InstructorQualificationsService {
    /**
     * Assigns an explicit subject qualification to an instructor.
     */
    static async assignQualification(
        dbClient: DbClient,
        args: {
            instructorId: string;
            subjectId: string;
            assignedByUserId: string;
            institutionId: string;
        },
    ) {
        const { instructorId, subjectId, assignedByUserId, institutionId } = args;

        // 1. Verify instructor belongs to same institution
        const instructor = await dbClient
            .selectFrom('instructors')
            .select(['instructor_id', 'institution_id'])
            .where('instructor_id', '=', instructorId)
            .executeTakeFirst();

        if (!instructor) {
            throw new HTTPException(404, {
                message: 'Instructor profile not found.',
            });
        }

        if (instructor.institution_id !== institutionId) {
            throw new HTTPException(403, {
                message: 'Forbidden. Instructor belongs to a different institution.',
            });
        }

        // 2. Verify subject exists in institution
        const subject = await dbClient
            .selectFrom('subjects')
            .select('subject_id')
            .where('subject_id', '=', subjectId)
            .where('institution_id', '=', institutionId)
            .executeTakeFirst();

        if (!subject) {
            throw new HTTPException(404, {
                message: 'Subject not found in your institution.',
            });
        }

        // 3. Insert explicit qualification
        await dbClient
            .insertInto('instructor_subjects')
            .values({
                instructor_id: instructorId,
                subject_id: subjectId,
                assigned_by_user_id: assignedByUserId,
                updated_at: new Date(),
            })
            .onConflict((oc) =>
                oc.columns(['instructor_id', 'subject_id']).doUpdateSet({
                    assigned_by_user_id: assignedByUserId,
                    updated_at: new Date(),
                }),
            )
            .execute();

        // Audit log the qualification assignment
        try {
            await LogsService.createLog(dbClient, {
                userId: assignedByUserId,
                action: 'instructor_qualification.assigned',
                resourceType: 'instructor_subject',
                resourceId: instructorId,
                activeInstitutionId: institutionId,
                details: { instructorId, subjectId, assignedByUserId },
            });
        } catch (logErr) {
            console.error('Failed to log instructor_qualification.assigned:', logErr);
        }
    }

    /**
     * Revokes an explicit subject qualification from an instructor.
     */
    static async revokeQualification(
        dbClient: DbClient,
        args: {
            instructorId: string;
            subjectId: string;
            institutionId: string;
        },
    ) {
        const { instructorId, subjectId, institutionId } = args;

        // 1. Verify instructor belongs to same institution
        const instructor = await dbClient
            .selectFrom('instructors')
            .select(['instructor_id', 'institution_id'])
            .where('instructor_id', '=', instructorId)
            .executeTakeFirst();

        if (!instructor) {
            throw new HTTPException(404, {
                message: 'Instructor profile not found.',
            });
        }

        if (instructor.institution_id !== institutionId) {
            throw new HTTPException(403, {
                message: 'Forbidden. Instructor belongs to a different institution.',
            });
        }

        // 2. Delete explicit qualification
        const result = await dbClient
            .deleteFrom('instructor_subjects')
            .where('instructor_id', '=', instructorId)
            .where('subject_id', '=', subjectId)
            .executeTakeFirst();

        if (Number(result.numDeletedRows) === 0) {
            throw new HTTPException(404, {
                message: 'Qualification assignment not found.',
            });
        }

        // Audit log the qualification revocation
        // Note: institutionId is available from the instructor record verified above
        try {
            await LogsService.createLog(dbClient, {
                userId: instructorId,
                action: 'instructor_qualification.revoked',
                resourceType: 'instructor_subject',
                resourceId: instructorId,
                activeInstitutionId: institutionId,
                details: { instructorId, subjectId },
            });
        } catch (logErr) {
            console.error('Failed to log instructor_qualification.revoked:', logErr);
        }
    }

    /**
     * Lists qualified instructors for a specific subject (both explicit & derived).
     */
    static async listQualifiedInstructors(
        dbClient: DbClient,
        args: {
            subjectId: string;
            institutionId: string;
        },
    ) {
        const { subjectId, institutionId } = args;

        // Explicit qualifications query
        const explicitQuery = dbClient
            .selectFrom('instructors as ins')
            .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
            .innerJoin('instructor_subjects as isub', 'isub.instructor_id', 'ins.instructor_id')
            .select([
                'ins.instructor_id',
                'ins.user_id',
                'ins.employee_number',
                sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
                sql<string>`'explicit'`.as('qualification_type'),
            ])
            .where('isub.subject_id', '=', subjectId)
            .where('ins.institution_id', '=', institutionId);

        // Derived qualifications query (from course matching)
        const derivedQuery = dbClient
            .selectFrom('instructors as ins')
            .innerJoin('user_profiles as up', 'up.user_id', 'ins.user_id')
            .innerJoin('instructor_courses as ic', 'ic.instructor_id', 'ins.instructor_id')
            .innerJoin('course_subjects as cs', 'cs.course_id', 'ic.course_id')
            .select([
                'ins.instructor_id',
                'ins.user_id',
                'ins.employee_number',
                sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('name'),
                sql<string>`'derived'`.as('qualification_type'),
            ])
            .where('cs.subject_id', '=', subjectId)
            .where('ins.institution_id', '=', institutionId);

        // Union both and aggregate to resolve overlaps (explicit takes priority)
        const results = await dbClient
            .selectFrom((eb) =>
                eb
                    .selectFrom(explicitQuery.as('exp'))
                    .unionAll(derivedQuery.as('der'))
                    .as('all_qual'),
            )
            .select([
                'all_qual.instructor_id',
                'all_qual.user_id',
                'all_qual.employee_number',
                'all_qual.name',
                sql<string>`min(all_qual.qualification_type)`.as('qualification_type'),
            ])
            .groupBy([
                'all_qual.instructor_id',
                'all_qual.user_id',
                'all_qual.employee_number',
                'all_qual.name',
            ])
            .orderBy('name', 'asc')
            .execute();

        return results;
    }
}
