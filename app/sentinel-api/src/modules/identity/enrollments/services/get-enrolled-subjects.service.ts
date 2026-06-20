import { type DbClient } from '@sentinel/db';
import { getEnrolledSubjectsData } from '../data/get-enrolled-subjects';

export type GetEnrolledSubjectsServiceArgs = {
    dbClient: DbClient;
    userId: string;
    search?: string;
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
}: GetEnrolledSubjectsServiceArgs) {
    return getEnrolledSubjectsData({ dbClient, userId, search });
}

export type GetEnrolledSubjectsServiceResponse = Awaited<
    ReturnType<typeof getEnrolledSubjectsService>
>;
