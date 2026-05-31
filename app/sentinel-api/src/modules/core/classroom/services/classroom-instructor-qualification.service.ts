import { type DbClient } from '@sentinel/db';

/**
 * Checks if an instructor is qualified for a subject (either explicitly or derived).
 */
export async function checkInstructorQualification(args: {
    dbClient: DbClient;
    instructorUserId: string;
    subjectId: string;
}) {
    const { dbClient, instructorUserId, subjectId } = args;

    const instructorRec = await dbClient
        .selectFrom('instructors')
        .select('instructor_id')
        .where('user_id', '=', instructorUserId)
        .executeTakeFirst();

    if (!instructorRec) {
        return { isQualified: false, reason: 'Instructor profile not found.' };
    }

    const instructorId = instructorRec.instructor_id;

    // Check explicit qualification
    const explicitQual = await dbClient
        .selectFrom('instructor_subjects')
        .select('instructor_subject_id')
        .where('instructor_id', '=', instructorId)
        .where('subject_id', '=', subjectId)
        .executeTakeFirst();

    if (explicitQual) {
        return { isQualified: true, type: 'explicit' };
    }

    // Check derived qualification
    const derivedQual = await dbClient
        .selectFrom('instructor_courses as ic')
        .innerJoin('course_subjects as cs', 'cs.course_id', 'ic.course_id')
        .select('cs.subject_id')
        .where('ic.instructor_id', '=', instructorId)
        .where('cs.subject_id', '=', subjectId)
        .executeTakeFirst();

    if (derivedQual) {
        return { isQualified: true, type: 'derived' };
    }

    return {
        isQualified: false,
        reason: 'Instructor does not have explicit or derived qualification for this subject.',
    };
}

/**
 * Gets the current system qualification mismatch handling mode from settings.
 */
export async function getQualificationMode(dbClient: DbClient): Promise<'BLOCK' | 'WARN' | 'ALLOW'> {
    const setting = await dbClient
        .selectFrom('system_settings')
        .select('setting_value')
        .where('setting_key', '=', 'classroom_assignment_qualification_mode')
        .executeTakeFirst();

    if (!setting || !setting.setting_value) {
        return 'WARN';
    }

    const val = typeof setting.setting_value === 'string'
        ? setting.setting_value
        : (setting.setting_value as any).mode || 'WARN';

    return val.toUpperCase() as 'BLOCK' | 'WARN' | 'ALLOW';
}
