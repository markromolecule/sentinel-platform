import { supportsInstructorCourseTable } from '../helper/instructor-course-compat';
import { formatUserRecords } from './get-users/get-users.formatters';
import {
    applyPagination,
    applyRequesterLimits,
    applySearchAndFilters,
} from './get-users/get-users.filters';
import {
    withBaseUserProfile,
    withEnrollmentAggregations,
    withInstructorCourseAggregations,
} from './get-users/get-users.query';
import type { GetUsersDataArgs, GetUsersRecord } from './get-users/get-users.types';

export async function getUsersData(args: GetUsersDataArgs) {
    const { dbClient } = args;
    const supportsInstructorCourses = await supportsInstructorCourseTable(dbClient);

    let query = withBaseUserProfile(dbClient)
        .$call((baseQuery) => withEnrollmentAggregations(baseQuery, dbClient))
        .$call((baseQuery) =>
            withInstructorCourseAggregations(baseQuery, dbClient, supportsInstructorCourses),
        );

    query = applyRequesterLimits(query, args, supportsInstructorCourses);
    query = applySearchAndFilters(query, args);
    query = applyPagination(query, args);

    const records: GetUsersRecord[] = await query.orderBy('up.last_name', 'asc').execute();

    return formatUserRecords(records);
}

export type GetUsersDataResponse = Awaited<ReturnType<typeof getUsersData>>;
