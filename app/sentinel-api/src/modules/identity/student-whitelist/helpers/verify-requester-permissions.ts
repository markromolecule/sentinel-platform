export function verifyRequesterPermissions({
    requesterRole,
    requesterInstitutionId,
}: {
    requesterRole?: string;
    requesterInstitutionId?: string;
}) {
    if (
        requesterRole !== 'admin' &&
        requesterRole !== 'superadmin' &&
        requesterRole !== 'support'
    ) {
        throw new Error('Forbidden. Insufficient permissions.');
    }

    if ((requesterRole === 'admin' || requesterRole === 'superadmin') && !requesterInstitutionId) {
        throw new Error('Forbidden: No institution assigned to this admin account');
    }
}

export function verifyRequesterInstitutionAccess({
    requesterRole,
    requesterInstitutionId,
    institutionId,
}: {
    requesterRole?: string;
    requesterInstitutionId?: string;
    institutionId: string;
}) {
    if (
        requesterRole !== 'support' &&
        requesterInstitutionId &&
        institutionId !== requesterInstitutionId
    ) {
        throw new Error('Forbidden: Cannot manage whitelist records outside your institution');
    }
}
