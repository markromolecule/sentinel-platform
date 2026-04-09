import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export async function getAccessControlOverviewData(dbClient: DbClient, settingsKey: string) {
    const [roleTotals, permissionTotals, assignmentTotals, overrideTotals, moduleTotals, settings] =
        await Promise.all([
            dbClient
                .selectFrom('roles')
                .select((eb) => [
                    eb.fn.countAll<number>().as('totalRoles'),
                    sql<number>`COUNT(*) FILTER (WHERE is_system = true)`.as('systemRoles'),
                ])
                .executeTakeFirstOrThrow(),
            dbClient
                .selectFrom('rbac_permissions')
                .select((eb) => [
                    eb.fn.countAll<number>().as('totalPermissions'),
                    sql<number>`COUNT(*) FILTER (WHERE is_system = false)`.as('customPermissions'),
                ])
                .executeTakeFirstOrThrow(),
            dbClient
                .selectFrom('user_roles')
                .select((eb) => eb.fn.countAll<number>().as('totalAssignments'))
                .executeTakeFirstOrThrow(),
            dbClient
                .selectFrom('rbac_user_permission_overrides')
                .select((eb) => eb.fn.countAll<number>().as('totalOverrides'))
                .executeTakeFirstOrThrow(),
            dbClient
                .selectFrom('rbac_permissions')
                .select(sql<number>`COUNT(DISTINCT module_key)`.as('modulesCovered'))
                .executeTakeFirstOrThrow(),
            dbClient
                .selectFrom('system_settings')
                .select('updated_at')
                .where('setting_key', '=', settingsKey)
                .executeTakeFirst(),
        ]);

    return {
        roleTotals,
        permissionTotals,
        assignmentTotals,
        overrideTotals,
        moduleTotals,
        settings,
    };
}
