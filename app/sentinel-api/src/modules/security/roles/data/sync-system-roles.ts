import { type DbClient } from '@sentinel/db';
import { SYSTEM_ROLE_BLUEPRINTS } from '@sentinel/shared/constants';

export async function syncSystemRoles(dbClient: DbClient) {
    for (const [roleName, blueprint] of Object.entries(SYSTEM_ROLE_BLUEPRINTS)) {
        await dbClient
            .insertInto('roles')
            .values({
                role_name: roleName,
                description: blueprint.description,
                is_system: true,
            })
            .onConflict((oc) =>
                oc.column('role_name').doUpdateSet({
                    description: blueprint.description,
                    is_system: true,
                    updated_at: new Date(),
                }),
            )
            .execute();
    }
}
