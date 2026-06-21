import { type DbClient } from '@sentinel/db';
import { getEnrolledSubjectsData } from '../data/get-enrolled-subjects';
import { paginateItems } from '../../../../lib/pagination';

export type GetEnrolledSubjectsServiceArgs = {
    dbClient: DbClient;
    userId: string;
    search?: string;
    page?: number;
    pageSize?: number;
};

/**
 * Returns all subjects a user (instructor) is enrolled in.
 *
 * @param args.dbClient - Database client
 * @param args.userId - User ID to look up
 * @param args.search - Optional search string
 */
export async function getEnrolledSubjectsService({
    dbClient,
    userId,
    search,
    page,
    pageSize,
}: GetEnrolledSubjectsServiceArgs) {
    const subjects = await getEnrolledSubjectsData({ dbClient, userId, search });
    return paginateItems(subjects, page, pageSize);
}

export type GetEnrolledSubjectsServiceResponse = Awaited<
    ReturnType<typeof getEnrolledSubjectsService>
>;
