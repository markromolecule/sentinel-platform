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

import { listClassroomInstructors } from './classroom-instructor-management.service';

export async function getInstructorClassrooms(
    dbClient: DbClient,
    { userId, institutionId, search }: ClassroomScope & { search?: string },
) {
    const classGroupColumnSupport = await getClassGroupColumnSupport(dbClient);

    if (!classGroupColumnSupport.hasClassName) {
        return [];
    }

    let query = (
        await buildAccessibleClassroomsQuery(dbClient, { userId, institutionId }, 'instructor')
    ).where('cg.class_name', 'is not', null);

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
