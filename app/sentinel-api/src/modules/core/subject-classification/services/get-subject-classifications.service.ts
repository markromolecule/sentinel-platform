import { type DbClient } from '@sentinel/db';
import { getSubjectClassificationsData } from '../data/get-subject-classifications';
import { getSubjectClassificationByIdData } from '../data/get-subject-classification-by-id';
import { mapClassificationRecord } from '../helper/subject-classification-mapper';
import { supportsSubjectClassificationTables } from '../../subjects/helper/subject-offering-compat';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';
import { resolveParentScope } from '../../inheritance/inheritance-resolver.helper';
import { isMissingSubjectOfferingColumnError } from '../../subjects/helper/subject-offering-compat';
import { paginateItems } from '../../../../lib/pagination';

/**
 * Service to handle retrieval and query of subject classifications.
 */
export class GetSubjectClassificationsService {
    private static async loadEffectiveClassificationRows(
        dbClient: DbClient,
        args: {
            institutionId?: string;
            search?: string;
            includeClassificationFields: boolean;
        },
    ) {
        return loadEffectiveRows<any>({
            institutionId: args.institutionId,
            dbClient,
            idKey: 'subject_classification_id',
            loadRows: (scopeInstitutionId) =>
                getSubjectClassificationsData({
                    dbClient,
                    institutionId: scopeInstitutionId,
                    search: args.search,
                    includeClassificationFields: args.includeClassificationFields,
                }),
        });
    }

    /**
     * Resolves the list of institution IDs that are visible under a parent scope.
     */
    static async getParentVisibleInstitutionIds(
        dbClient: DbClient,
        institutionId?: string,
    ): Promise<string[] | null> {
        if (!institutionId) {
            return null;
        }

        const scope = await resolveParentScope(dbClient, institutionId);

        if (scope.institutionKind !== 'PARENT') {
            return null;
        }

        const branches = await dbClient
            .selectFrom('institutions')
            .select('id')
            .where('parent_institution_id', '=', institutionId)
            .execute();

        return [institutionId, ...branches.map((branch) => branch.id)];
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
        const supportsTables = await supportsSubjectClassificationTables(dbClient);

        try {
            const parentVisibleInstitutionIds =
                await GetSubjectClassificationsService.getParentVisibleInstitutionIds(
                    dbClient,
                    institutionId,
                );

            if (parentVisibleInstitutionIds) {
                const branchScopedRecords = await Promise.all(
                    parentVisibleInstitutionIds.map((scopeInstitutionId) =>
                        // Parent users need each visible institution's effective view so inherited
                        // rows remain visible with accurate local/inherited status.
                        GetSubjectClassificationsService.loadEffectiveClassificationRows(dbClient, {
                            institutionId: scopeInstitutionId,
                            search,
                            includeClassificationFields: supportsTables,
                        }),
                    ),
                );

                const records = branchScopedRecords
                    .flat()
                    .sort((left: any, right: any) =>
                        String(left.name ?? '').localeCompare(String(right.name ?? '')),
                    )
                    .map(mapClassificationRecord);

                return paginateItems(records, page, pageSize);
            }

            const records =
                await GetSubjectClassificationsService.loadEffectiveClassificationRows(dbClient, {
                    institutionId,
                    search,
                    includeClassificationFields: supportsTables,
                });

            return paginateItems(records.map(mapClassificationRecord), page, pageSize);
        } catch (error) {
            if (!isMissingSubjectOfferingColumnError(error)) {
                throw error;
            }

            return paginateItems([], page, pageSize);
        }
    }

    /**
     * Retrieves a single subject classification by ID, taking parent/inherited institution scopes into account.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the subject classification.
     * @param institutionId - Optional institution ID context.
     * @returns The resolved subject classification, or null if not found.
     */
    static async getSubjectClassification(dbClient: DbClient, id: string, institutionId?: string) {
        const parentVisibleInstitutionIds =
            await GetSubjectClassificationsService.getParentVisibleInstitutionIds(
                dbClient,
                institutionId,
            );
        const supportsTables = await supportsSubjectClassificationTables(dbClient);

        if (parentVisibleInstitutionIds) {
            for (const scopeInstitutionId of parentVisibleInstitutionIds) {
                const effectiveRecords =
                    await GetSubjectClassificationsService.loadEffectiveClassificationRows(
                        dbClient,
                        {
                            institutionId: scopeInstitutionId,
                            includeClassificationFields: supportsTables,
                        },
                    );
                const effectiveRecord = effectiveRecords.find(
                    (record: any) =>
                        record.subject_classification_id === id || record.sourceRecordId === id,
                );

                if (!effectiveRecord) {
                    continue;
                }

                return mapClassificationRecord(effectiveRecord);
            }

            return null;
        }

        if (institutionId) {
            const effectiveRecords =
                await GetSubjectClassificationsService.loadEffectiveClassificationRows(dbClient, {
                    institutionId,
                    includeClassificationFields: supportsTables,
                });
            const effectiveRecord = effectiveRecords.find(
                (record: any) =>
                    record.subject_classification_id === id || record.sourceRecordId === id,
            );

            if (effectiveRecord) {
                return mapClassificationRecord(effectiveRecord);
            }
        }

        const record = await getSubjectClassificationByIdData({
            dbClient,
            id,
            institutionId,
        });

        if (!record) {
            return null;
        }

        return mapClassificationRecord(record);
    }
}
