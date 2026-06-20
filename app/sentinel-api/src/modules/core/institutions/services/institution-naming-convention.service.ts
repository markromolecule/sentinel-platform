import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getInstitutionByIdData } from '../data/get-institution-by-id';
import { getNamingConventionData } from '../data/get-naming-convention';
import { saveNamingConventionData } from '../data/save-naming-convention';
import { type SaveInstitutionNamingConventionBody } from '../institution.dto';
import {
    type NamingConventionRecord,
    formatNamingConvention,
    mergeNamingConventionRecords,
} from './institution-formatter.service';

/**
 * Saves or updates a naming convention for the given institution.
 * Validates that the institution exists before saving.
 *
 * @param dbClient - The active database client.
 * @param institutionId - The institution UUID to attach the convention to.
 * @param data - The naming convention payload.
 * @param userId - Optional user ID for audit tracking.
 * @returns Formatted naming convention object.
 */
export async function saveNamingConvention(
    dbClient: DbClient,
    institutionId: string,
    data: SaveInstitutionNamingConventionBody,
    userId?: string | null,
) {
    const institution = await getInstitutionByIdData({ dbClient, id: institutionId });

    if (!institution) {
        throw new HTTPException(404, { message: 'Institution not found' });
    }

    const record = await saveNamingConventionData({
        dbClient,
        values: {
            institution_id: institutionId,
            room_code_format: data.roomCodeFormat ?? null,
            section_code_format: data.sectionCodeFormat ?? null,
            naming_rules: data.namingRules,
            created_by: userId ?? null,
            updated_by: userId ?? null,
        },
    });

    return formatNamingConvention(
        record as unknown as NamingConventionRecord,
        institutionId,
        false,
    );
}

/**
 * Retrieves the effective naming convention for an institution,
 * merging in the parent institution's convention if the institution
 * does not define its own.
 *
 * @param dbClient - The active database client.
 * @param institutionId - The institution UUID.
 * @returns Formatted effective naming convention, or null if none exists.
 */
export async function getEffectiveNamingConvention(dbClient: DbClient, institutionId: string) {
    const institution = await getInstitutionByIdData({ dbClient, id: institutionId });

    if (!institution) {
        throw new HTTPException(404, { message: 'Institution not found' });
    }

    const localRecord = await getNamingConventionData({ dbClient, institutionId });
    const parentInstitutionId = institution.parent_institution_id ?? null;
    const parentRecord = parentInstitutionId
        ? await getNamingConventionData({ dbClient, institutionId: parentInstitutionId })
        : null;

    if (localRecord) {
        const effectiveRecord = mergeNamingConventionRecords(localRecord, parentRecord);
        return formatNamingConvention(effectiveRecord, localRecord.institution_id, false);
    }

    if (parentRecord) {
        return formatNamingConvention(parentRecord, parentRecord.institution_id, true);
    }

    return null;
}
