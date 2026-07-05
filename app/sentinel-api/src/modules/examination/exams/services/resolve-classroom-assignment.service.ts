import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type ResolvedClassroomAssignment = {
    classGroupId: string | null;
    className: string | null;
    institutionId: string | null;
    subjectId: string | null;
    subjectTitle: string | null;
    sectionId: string | null;
    sectionName: string | null;
};

export type ResolvedExamAssignmentTargets = {
    classroomAssignment: ResolvedClassroomAssignment;
    assignedSectionIds: string[];
    resolvedClassrooms: ResolvedClassroomAssignment[];
};

type RawClassroomAssignmentRecord = {
    class_group_id: string;
    class_name: string | null;
    institution_id: string | null;
    subject_id: string | null;
    subject_title: string | null;
    section_id: string | null;
    section_name: string | null;
};

function mapResolvedClassroomAssignment(classroom: RawClassroomAssignmentRecord) {
    if (!classroom.subject_id) {
        throw new HTTPException(400, {
            message: 'Selected classroom is missing a subject assignment.',
        });
    }

    return {
        classGroupId: classroom.class_group_id,
        className: classroom.class_name,
        institutionId: classroom.institution_id,
        subjectId: classroom.subject_id,
        subjectTitle: classroom.subject_title ?? null,
        sectionId: classroom.section_id ?? null,
        sectionName: classroom.section_name ?? null,
    } satisfies ResolvedClassroomAssignment;
}

export function buildAccessibleClassroomAssignmentQuery(args: {
    dbClient: DbClient;
    userId: string;
    institutionId?: string;
    role?: string;
}) {
    const { dbClient, userId, institutionId, role } = args;
    const isCoreAdmin = role ? ['support', 'superadmin', 'admin'].includes(role) : false;

    if (isCoreAdmin) {
        let query = dbClient
            .selectFrom('class_groups as cg')
            .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
            .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
            .select([
                'cg.class_group_id',
                'cg.class_name',
                'cg.institution_id',
                'cg.subject_id',
                's.subject_title',
                'cg.section_id',
                'sec.section_name',
            ]);

        if (institutionId) {
            query = query.where('cg.institution_id', '=', institutionId);
        }

        return query;
    }

    let query = dbClient
        .selectFrom('class_groups as cg')
        .innerJoin('class_roles as cr', 'cr.class_group_id', 'cg.class_group_id')
        .innerJoin('roles as r', 'r.role_id', 'cr.role_id')
        .leftJoin('subjects as s', 's.subject_id', 'cg.subject_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .select([
            'cg.class_group_id',
            'cg.class_name',
            'cg.institution_id',
            'cg.subject_id',
            's.subject_title',
            'cg.section_id',
            'sec.section_name',
        ])
        .where('cr.user_id', '=', userId)
        .where('r.role_name', '=', 'instructor');

    if (institutionId) {
        query = query.where('cg.institution_id', '=', institutionId);
    }

    return query;
}

export async function resolveInstructorClassroomAssignment(args: {
    dbClient: DbClient;
    classroomId: string;
    userId: string;
    institutionId?: string;
    role?: string;
}) {
    const { classroomId, ...queryArgs } = args;
    const classroom = await buildAccessibleClassroomAssignmentQuery(queryArgs)
        .where('cg.class_group_id', '=', classroomId)
        .executeTakeFirst();

    if (!classroom) {
        throw new HTTPException(404, { message: 'Classroom not found.' });
    }

    return mapResolvedClassroomAssignment(classroom as RawClassroomAssignmentRecord);
}

export async function resolveInstructorExamAssignmentTargets(args: {
    dbClient: DbClient;
    classroomId: string;
    userId: string;
    institutionId?: string;
    sectionIds?: string[];
    role?: string;
}): Promise<ResolvedExamAssignmentTargets> {
    const { dbClient, sectionIds, ...assignmentArgs } = args;
    const classroomAssignment = await resolveInstructorClassroomAssignment({
        dbClient,
        ...assignmentArgs,
    });
    const requestedSectionIds = Array.from(
        new Set(
            [classroomAssignment.sectionId, ...(sectionIds ?? [])].filter(
                (value): value is string => Boolean(value),
            ),
        ),
    );

    if (requestedSectionIds.length <= 1) {
        return {
            classroomAssignment,
            assignedSectionIds: requestedSectionIds.filter(
                (sectionId) => sectionId !== classroomAssignment.sectionId,
            ),
            resolvedClassrooms: classroomAssignment.classGroupId ? [classroomAssignment] : [],
        };
    }

    const accessibleTargets = await buildAccessibleClassroomAssignmentQuery({
        dbClient,
        userId: assignmentArgs.userId,
        institutionId: assignmentArgs.institutionId,
        role: assignmentArgs.role,
    })
        .where('cg.subject_id', '=', classroomAssignment.subjectId)
        .where('cg.section_id', 'in', requestedSectionIds)
        .execute();

    const accessibleSectionIds = new Set(
        accessibleTargets
            .map((target) => target.section_id)
            .filter((value): value is string => Boolean(value)),
    );
    const missingSectionIds = requestedSectionIds.filter(
        (sectionId) => !accessibleSectionIds.has(sectionId),
    );

    if (missingSectionIds.length > 0) {
        throw new HTTPException(404, {
            message:
                'One or more selected sections are outside your classroom scope for this subject.',
        });
    }

    const resolvedClassrooms = (accessibleTargets as RawClassroomAssignmentRecord[]).map(
        mapResolvedClassroomAssignment,
    );

    return {
        classroomAssignment,
        assignedSectionIds: requestedSectionIds.filter(
            (sectionId) => sectionId !== classroomAssignment.sectionId,
        ),
        resolvedClassrooms,
    };
}

export async function resolveInstructorLegacyExamAssignment(args: {
    dbClient: DbClient;
    userId: string;
    institutionId?: string;
    subjectId?: string;
    sectionId?: string;
    sectionIds?: string[];
    role?: string;
}) {
    const { subjectId, sectionId, sectionIds, ...queryArgs } = args;
    const targetSectionIds = Array.from(
        new Set(
            [sectionId, ...(sectionIds ?? [])].filter((value): value is string => Boolean(value)),
        ),
    );

    if (!subjectId || targetSectionIds.length !== 1) {
        throw new HTTPException(400, {
            message: 'Select a classroom or provide exactly one legacy section target.',
        });
    }

    const classroom = await buildAccessibleClassroomAssignmentQuery(queryArgs)
        .where('cg.subject_id', '=', subjectId)
        .where('cg.section_id', '=', targetSectionIds[0])
        .executeTakeFirst();

    if (!classroom) {
        throw new HTTPException(404, {
            message: 'No classroom assignment was found for the selected subject and section.',
        });
    }

    return mapResolvedClassroomAssignment(classroom as RawClassroomAssignmentRecord);
}

/**
 * Maps resolved exam assignment targets and other assignment details into section assignment inputs.
 * Pairs the first instructor (from instructorId or instructorIds) with all target classroom rows.
 *
 * @param args - Assignment resolution details, room, schedule, and instructors
 * @returns Array of section assignment input objects
 */
export function buildExamSectionAssignmentInputs(args: {
    targets: ResolvedExamAssignmentTargets;
    roomId?: string | null;
    startDateTime?: string | null;
    instructorId?: string | null;
    instructorIds?: string[] | null;
}): Array<{
    sectionId: string;
    classGroupId: string | null;
    roomId: string | null;
    instructorId: string | null;
    scheduledAt: string | null;
}> {
    const { targets, roomId, startDateTime, instructorId, instructorIds } = args;

    let resolvedInstructorId: string | null = null;
    if (instructorId) {
        resolvedInstructorId = instructorId;
    } else if (instructorIds && instructorIds.length > 0) {
        resolvedInstructorId = instructorIds[0];
    }

    const { resolvedClassrooms } = targets;

    if (!resolvedClassrooms || resolvedClassrooms.length === 0) {
        return [];
    }

    return resolvedClassrooms
        .filter((c) => c.classGroupId && c.sectionId)
        .map((c) => ({
            sectionId: c.sectionId as string,
            classGroupId: c.classGroupId,
            roomId: roomId || null,
            instructorId: resolvedInstructorId,
            scheduledAt: startDateTime || null,
        }));
}
