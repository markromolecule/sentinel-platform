import { type DbClient } from '@sentinel/db';
import type { AccessControlOverview } from '@sentinel/shared/types';
import { parseCount, toNullableDate } from '../../roles/data/get-roles';
import { getAccessControlOverviewData } from '../data/get-access-control-overview';
import { ensureAccessControlCatalogs } from './access-control-catalog.service';

export const EXAMINATION_SETTINGS_KEY = 'examination.global_defaults';

export class AccessControlOverviewService {
    static async getOverview(dbClient: DbClient): Promise<AccessControlOverview> {
        await ensureAccessControlCatalogs(dbClient);

        const {
            roleTotals,
            permissionTotals,
            assignmentTotals,
            overrideTotals,
            moduleTotals,
            settings,
        } = await getAccessControlOverviewData(dbClient, EXAMINATION_SETTINGS_KEY);

        return {
            totalRoles: parseCount(roleTotals.totalRoles),
            systemRoles: parseCount(roleTotals.systemRoles),
            totalPermissions: parseCount(permissionTotals.totalPermissions),
            customPermissions: parseCount(permissionTotals.customPermissions),
            totalAssignments: parseCount(assignmentTotals.totalAssignments),
            totalOverrides: parseCount(overrideTotals.totalOverrides),
            modulesCovered: parseCount(moduleTotals.modulesCovered),
            examinationSettingsUpdatedAt: toNullableDate(settings?.updated_at),
        };
    }
}
