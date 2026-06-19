import { type DbClient } from '@sentinel/db';
import { buildClassroomResponse } from '../helper/classroom-mappers';
import { getClassGroupColumnSupport } from '../helper/classroom-schema-compat';
import {
    type ClassroomAccessScope,
    type ClassroomScope,
    type RawClassroomRecord,
} from '../helper/classroom.types';
import {
    buildAccessibleClassroomsQuery,
    getAccessibleClassroomOrThrow,
} from './classroom-access-query.service';
import { getClassroomStudents } from './classroom-students-query.service';

/**
 * Retrieves accessible classrooms for an instructor (or admin) with optional query filtering.
 *
 * @param dbClient - The database client instance.
 * @param options.userId - The authenticated user's ID.
 * @param options.institutionId - The authenticated user's institution ID.
 * @param options.search - Optional text search filter.
 * @param options.departmentId - Optional department ID filter.
 * @param options.userRole - Optional role of the user.
 * @param options.status - Optional status filter (active, archived, all).
 * @param options.subjectId - Optional subject ID filter.
 * @returns A promise resolving to the list of classrooms.
 */
export async function getInstructorClassrooms(
    dbClient: DbClient,
    {
        userId,
        institutionId,
        search,
        departmentId,
        userRole,
        status,
        subjectId,
    }: ClassroomScope & {
        search?: string;
        departmentId?: string;
        userRole?: string;
        status?: 'active' | 'archived' | 'all';
        subjectId?: string;
    },
) {
    const classGroupColumnSupport = await getClassGroupColumnSupport(dbClient);

    if (!classGroupColumnSupport.hasClassName) {
        return [];
    }

    const accessRole =
        userRole && ['admin', 'superadmin', 'support'].includes(userRole) ? 'admin' : 'instructor';

    let query = (
        await buildAccessibleClassroomsQuery(
            dbClient,
            { userId, institutionId },
            accessRole as any,
            { status },
        )
    ).where('cg.class_name', 'is not', null);

    if (subjectId) {
        query = query.where('cg.subject_id', '=', subjectId);
    }

    if (departmentId) {
        query = query.where('sec.department_id', '=', departmentId);
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('cg.class_name', 'ilike', `%${search}%`),
                eb('s.subject_code', 'ilike', `%${search}%`),
                eb('s.subject_title', 'ilike', `%${search}%`),
                eb('sec.section_name', 'ilike', `%${search}%`),
                eb('t.academic_year', 'ilike', `%${search}%`),
                eb('t.semester', 'ilike', `%${search}%`),
            ]),
        );
    }

    const classrooms = await query
        .$if(classGroupColumnSupport.hasUpdatedAt, (qb) => qb.orderBy('cg.updated_at', 'desc'))
        .orderBy('cg.created_at', 'desc')
        .orderBy('cg.class_name', 'asc')
        .execute();

    return classrooms.map((classroom) => buildClassroomResponse(classroom as RawClassroomRecord));
}

export async function getInstructorClassroomById(
    dbClient: DbClient,
    accessScope: ClassroomAccessScope,
) {
    const classroom = await getAccessibleClassroomOrThrow(dbClient, accessScope);
    const students = await getClassroomStudents(dbClient, accessScope);

    const response = buildClassroomResponse(classroom);

    return {
        ...response,
        students,
    };
}
