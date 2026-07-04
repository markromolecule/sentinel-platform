import { type DbClient } from '@sentinel/db';
import { GetSubjectClassificationsService } from './services/get-subject-classifications.service';
import { ManageSubjectClassificationService } from './services/manage-subject-classification.service';
import {
    type CreateSubjectClassificationPayload,
    type UpdateSubjectClassificationPayload,
} from './helper/subject-classification-validator';
import {
    DUPLICATE_SUBJECT_CLASSIFICATION_ERROR,
    INVALID_SUBJECT_CLASSIFICATION_PAYLOAD,
} from './helper/subject-classification-errors';

/**
 * Service facade to orchestrate subject classification operations.
 */
export class SubjectClassificationService {
    static readonly duplicateCode = DUPLICATE_SUBJECT_CLASSIFICATION_ERROR;
    static readonly invalidPayloadCode = INVALID_SUBJECT_CLASSIFICATION_PAYLOAD;
    /**
     * Resolves the list of institution IDs that are visible under a parent scope.
     */
    static async getParentVisibleInstitutionIds(
        dbClient: DbClient,
        institutionId?: string,
    ): Promise<string[] | null> {
        return GetSubjectClassificationsService.getParentVisibleInstitutionIds(
            dbClient,
            institutionId,
        );
    }

    /**
     * Retrieves all subject classifications based on filter criteria, applying scope and pagination.
     *
     * @param dbClient - The database client instance.
     * @param institutionId - Optional institution ID context.
     * @param search - Optional search query string.
     * @param page - Optional page index.
     * @param pageSize - Optional page size.
     * @returns A paginated list of subject classifications.
     */
    static async getSubjectClassifications(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        page?: number,
        pageSize?: number,
    ) {
        return GetSubjectClassificationsService.getSubjectClassifications(
            dbClient,
            institutionId,
            search,
            page,
            pageSize,
        );
    }

    /**
     * Retrieves a single subject classification by ID.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the subject classification.
     * @param institutionId - Optional institution ID context.
     * @returns The resolved subject classification, or null if not found.
     */
    static async getSubjectClassification(dbClient: DbClient, id: string, institutionId?: string) {
        return GetSubjectClassificationsService.getSubjectClassification(
            dbClient,
            id,
            institutionId,
        );
    }

    /**
     * Creates a new subject classification group card.
     *
     * @param dbClient - The database client instance.
     * @param data - The creation payload.
     * @returns The created subject classification.
     */
    static async createSubjectClassification(
        dbClient: DbClient,
        data: CreateSubjectClassificationPayload,
    ) {
        return ManageSubjectClassificationService.createSubjectClassification(dbClient, data);
    }

    /**
     * Updates an existing subject classification group card.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the classification to update.
     * @param data - The update payload.
     * @param institutionId - Optional institution ID context.
     * @returns The updated subject classification.
     */
    static async updateSubjectClassification(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectClassificationPayload,
        institutionId?: string,
    ) {
        return ManageSubjectClassificationService.updateSubjectClassification(
            dbClient,
            id,
            data,
            institutionId,
        );
    }

    /**
     * Deletes a subject classification group card.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the classification to delete.
     * @param institutionId - Optional institution ID context.
     * @param actorUserId - Optional actor user ID.
     * @returns The deleted classification record.
     */
    static async deleteSubjectClassification(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return ManageSubjectClassificationService.deleteSubjectClassification(
            dbClient,
            id,
            institutionId,
            actorUserId,
        );
    }
}
