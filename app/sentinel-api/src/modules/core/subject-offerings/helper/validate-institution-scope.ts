import { buildSubjectOfferingError } from './subject-offering-errors';

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
