import { type DbClient } from '@sentinel/db';
import { SubjectCrudService } from './subject-crud.service';
import { paginateItems } from '../../../../lib/pagination';

/**
 * Service to handle retrieval and pagination of subjects.
 */
export class GetSubjectsService {
    /**
     * Retrieves a list of subjects, optionally filtered by institution and search term,
     * and paginates the results.
     *
     * @param dbClient - The database client instance.
     * @param institutionId - Optional institution ID to filter subjects.
     * @param search - Optional search query string.
     * @param page - Optional page number.
     * @param pageSize - Optional page size.
     * @returns A paginated list of subjects or the full array.
     */
    static async getSubjects(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        page?: number,
        pageSize?: number,
    ) {
        const subjects = await SubjectCrudService.getSubjects(dbClient, institutionId, search);

        return paginateItems(subjects, page, pageSize);
    }
}
