import { type DbClient } from '@sentinel/db';
import { getSemestersData } from '../data/get-semesters';
import { getInstitutionKindData } from '../data/get-institution-kind';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';
import { mapSemesterResponse } from './map-semester-response';
import { paginateItems } from '../../../../lib/pagination';

export type GetSemestersServiceArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
};

/**
 * Retrieves semesters for an institution. Child (branch) institutions
 * are automatically redirected to their parent's semester pool before
 * applying inheritance resolution.
 *
 * @param args.dbClient - Database client
 * @param args.institutionId - Institution context; undefined returns all
 * @param args.search - Optional search string
 * @returns Mapped semester response objects
 */
export async function getSemestersService({
    dbClient,
    institutionId,
    search,
    page,
    pageSize,
}: GetSemestersServiceArgs) {
    let effectiveInstitutionId = institutionId;

    if (institutionId) {
        const institution = await getInstitutionKindData({ dbClient, institutionId });
        if (institution?.institution_kind === 'CHILD' && institution.parent_institution_id) {
            effectiveInstitutionId = institution.parent_institution_id;
        }
    }

    const rawSemesters = await loadEffectiveRows<any>({
        dbClient,
        institutionId: effectiveInstitutionId,
        idKey: 'term_id',
        loadRows: (scopeInstitutionId) =>
            getSemestersData({ dbClient, institutionId: scopeInstitutionId, search }),
    });

    return paginateItems(rawSemesters.map(mapSemesterResponse), page, pageSize);
}

export type GetSemestersServiceResponse = Awaited<ReturnType<typeof getSemestersService>>;
