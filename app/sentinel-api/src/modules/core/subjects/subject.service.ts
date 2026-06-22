import { type DbClient } from '@sentinel/db';
import { GetSubjectsService } from './services/get-subjects.service';
import { ManageSubjectsService } from './services/manage-subjects.service';

type SubjectCorePayload = {
    code: string;
    title: string;
};

type CreateSubjectPayload = SubjectCorePayload & {
    created_by?: string;
    institution_id?: string | null;
};

type UpdateSubjectPayload = Partial<SubjectCorePayload> & {
    updated_by?: string;
};

/**
 * Service facade to orchestrate subject catalog operations.
 */
export class SubjectService {
    /**
     * Retrieves and paginates subjects.
     *
     * @param dbClient - The database client instance.
     * @param institutionId - Optional institution ID.
     * @param search - Optional search string.
     * @param page - Optional page index.
     * @param pageSize - Optional page size.
     * @returns A paginated subjects result.
     */
    static async getSubjects(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        page?: number,
        pageSize?: number,
    ) {
        return GetSubjectsService.getSubjects(dbClient, institutionId, search, page, pageSize);
    }

    /**
     * Creates a new subject.
     *
     * @param dbClient - The database client instance.
     * @param data - The create payload.
     * @returns The created subject record.
     */
    static async createSubject(dbClient: DbClient, data: CreateSubjectPayload) {
        return ManageSubjectsService.createSubject(dbClient, data);
    }

    /**
     * Updates an existing subject.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the subject.
     * @param data - The update payload.
     * @param institutionId - Optional institution ID.
     * @returns The updated subject record.
     */
    static async updateSubject(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectPayload,
        institutionId?: string,
    ) {
        return ManageSubjectsService.updateSubject(dbClient, id, data, institutionId);
    }

    /**
     * Deletes a subject by ID.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the subject.
     * @param institutionId - Optional institution ID.
     * @param actorUserId - Optional actor user ID.
     */
    static async deleteSubject(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return ManageSubjectsService.deleteSubject(dbClient, id, institutionId, actorUserId);
    }

    /**
     * Bulk deletes multiple subjects.
     *
     * @param dbClient - The database client instance.
     * @param ids - The array of subject IDs.
     * @param institutionId - Optional institution ID.
     * @param actorUserId - Optional actor user ID.
     * @returns The deletion count result.
     */
    static async deleteSelectedSubjects(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        return ManageSubjectsService.deleteSelectedSubjects(dbClient, ids, institutionId, actorUserId);
    }
}
