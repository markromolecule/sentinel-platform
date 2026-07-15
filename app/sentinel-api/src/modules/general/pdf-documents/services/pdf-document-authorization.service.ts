import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { hasActivePermission } from '../../../../lib/permissions';

type RequirePdfDocumentAccessArgs = {
    role?: string | null;
    activePermissionKeys?: string[];
    requiredPermissions: string | string[];
    missingRoleMessage?: string;
    missingPermissionMessage?: string;
};

/**
 * Enforces Support-role access plus at least one required active permission for PDF document routes.
 */
export function requirePdfDocumentAccess({
    role,
    activePermissionKeys = [],
    requiredPermissions,
    missingRoleMessage = 'Forbidden. Support role is required.',
    missingPermissionMessage = 'Forbidden. Missing required PDF document permission.',
}: RequirePdfDocumentAccessArgs): void {
    if (String(role ?? '').toLowerCase() !== 'support') {
        throw new HTTPException(403, { message: missingRoleMessage });
    }

    if (!hasActivePermission(activePermissionKeys, requiredPermissions)) {
        throw new HTTPException(403, { message: missingPermissionMessage });
    }
}

/**
 * Validates that overall report templates use either the global scope or a parent institution.
 */
export async function assertOverallReportTemplateScope(
    dbClient: DbClient,
    institutionId?: string | null,
): Promise<void> {
    if (!institutionId) {
        return;
    }

    const institution = await dbClient
        .selectFrom('institutions')
        .select(['id', 'institution_kind'])
        .where('id', '=', institutionId)
        .executeTakeFirst();

    if (!institution) {
        throw new HTTPException(400, {
            message: `Institution ${institutionId} does not exist.`,
        });
    }

    if (institution.institution_kind !== 'PARENT') {
        throw new HTTPException(400, {
            message: 'Overall report templates support only parent institutions.',
        });
    }
}
