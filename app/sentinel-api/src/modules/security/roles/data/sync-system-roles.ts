import { type DbClient } from '@sentinel/db';
import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';

export async function syncSystemRoles(dbClient: DbClient) {
    const roleEntries = Object.entries(SYSTEM_ROLE_BLUEPRINTS);

    if (roleEntries.length === 0) {
        return;
    }

    const existingRoles = await dbClient
        .selectFrom('roles')
        .select(['role_id', 'role_name'])
        .where(
            'role_name',
            'in',
            roleEntries.map(([roleName]) => roleName),
        )
        .execute();

    const existingRoleNames = new Set(existingRoles.map((role) => role.role_name));

    for (const [roleName, blueprint] of roleEntries) {
        if (!existingRoleNames.has(roleName)) {
            continue;
        }

        await dbClient
            .updateTable('roles')
            .set({
                description: blueprint.description,
                is_system: true,
                updated_at: new Date(),
            })
            .where('role_name', '=', roleName)
            .execute();
    }

    const missingRoles = roleEntries
        .filter(([roleName]) => !existingRoleNames.has(roleName))
        .map(([roleName, blueprint]) => ({
            role_name: roleName,
            description: blueprint.description,
            is_system: true,
        }));

    if (missingRoles.length === 0) {
        return;
    }

    await dbClient.insertInto('roles').values(missingRoles).execute();
}
