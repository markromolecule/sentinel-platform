export function verifyRequesterPermissions({
    requesterRole,
    requesterInstitutionId,
}: {
    requesterRole?: string;
    requesterInstitutionId?: string;
}) {
    // Permission checks are now handled at the controller layer via requireActivePermission.
    // Scoping is handled by resolveStudentWhitelistScope helpers.

    if (requesterRole === 'admin' && !requesterInstitutionId) {
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
