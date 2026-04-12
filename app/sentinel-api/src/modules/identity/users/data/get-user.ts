import { HTTPException } from 'hono/http-exception';
import { supportsInstructorCourseTable } from '../helper/instructor-course-compat';
import { formatUserRecord } from './get-user/get-user.formatters';
import { applyInstitutionScope, applyRequesterLimits } from './get-user/get-user.filters';
import { withBaseUserProfile, withInstructorCourseAggregations } from './get-user/get-user.query';
import type { GetUserDataArgs, GetUserRecord } from './get-user/get-user.types';

export async function getUserData({
    dbClient,
    id,
    institutionId,
    requesterRole,
    requesterUserId,
    requesterDepartmentId,
    requesterCourseId,
}: GetUserDataArgs) {
    const supportsInstructorCourses = await supportsInstructorCourseTable(dbClient);

    let query = withBaseUserProfile(dbClient, id).$call((baseQuery) =>
        withInstructorCourseAggregations(baseQuery, dbClient, supportsInstructorCourses),
    );

    query = applyInstitutionScope(query, {
        dbClient,
        id,
        institutionId,
        requesterRole,
        requesterUserId,
        requesterDepartmentId,
        requesterCourseId,
    });
    query = applyRequesterLimits(
        query,
        {
            dbClient,
            id,
            institutionId,
            requesterRole,
            requesterUserId,
            requesterDepartmentId,
            requesterCourseId,
        },
        supportsInstructorCourses,
    );

    const record = await query.executeTakeFirst();

    if (!record) {
        throw new HTTPException(404, { message: 'User not found' });
    }

    return formatUserRecord(record as GetUserRecord);
}

export type { GetUserDataArgs } from './get-user/get-user.types';
export type GetUserDataResponse = Awaited<ReturnType<typeof getUserData>>;
