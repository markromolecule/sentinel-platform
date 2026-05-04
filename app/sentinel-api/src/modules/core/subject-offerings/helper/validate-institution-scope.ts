import { buildSubjectOfferingError } from './subject-offering-errors';
import { type DbClient } from '@sentinel/db';
import { resolveParentScope } from '../../inheritance/inheritance-resolver.helper';

export function validateInstitutionScope(
    entity: { institution_id: string | null } | undefined,
    institutionId: string | null | undefined,
    label: string,
) {
    if (!entity) {
        return;
    }

    if (institutionId && entity.institution_id && entity.institution_id !== institutionId) {
        throw buildSubjectOfferingError(
            `${label} does not belong to the current institution`,
            '23503',
        );
    }
}

export async function validateEffectiveInstitutionScope(
    dbClient: DbClient,
    entity: { institution_id: string | null } | undefined,
    institutionId: string | null | undefined,
    label: string,
) {
    if (!entity || !institutionId || !entity.institution_id) {
        return;
    }

    if (entity.institution_id === institutionId) {
        return;
    }

    const scope = await resolveParentScope(dbClient, institutionId);

    if (scope.parentInstitutionId === entity.institution_id) {
        return;
    }

    throw buildSubjectOfferingError(`${label} does not belong to the current institution`, '23503');
}
