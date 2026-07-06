import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

/**
 * Repository layer for Roles database operations.
 */
export class RolesRepository {
    /**
     * Retrieve all roles with related stats, optionally filtered by search.
     */
    static async findAllRoles(dbClient: DbClient, search?: string) {
        let query = dbClient
            .selectFrom('roles')
            .leftJoin('rbac_role_permissions as rrp', 'rrp.role_id', 'roles.role_id')
            .leftJoin('user_roles as ur', 'ur.role_id', 'roles.role_id')
            .select([
                'roles.role_id',
                'roles.role_name',
                'roles.slug',
                'roles.description',
                'roles.is_system',
                'roles.domain_scope',
                'roles.is_active',
                'roles.assignable_by',
                'roles.permission_sync_mode',
                'roles.created_at',
                'roles.updated_at',
                sql<
                    string[]
                >`COALESCE(ARRAY_AGG(DISTINCT rrp.permission_id) FILTER (WHERE rrp.permission_id IS NOT NULL), ARRAY[]::uuid[])`.as(
                    'permissionIds',
                ),
                sql<number>`COUNT(DISTINCT rrp.permission_id)`.as('permissionCount'),
                sql<number>`COUNT(DISTINCT ur.user_id)`.as('assignmentCount'),
            ]);

        if (search) {
            query = query.where((eb) =>
                eb.or([
                    eb('roles.role_name', 'ilike', `%${search}%`),
                    eb('roles.slug', 'ilike', `%${search}%`),
                    eb('roles.description', 'ilike', `%${search}%`),
                ]),
            );
        }

        return query
            .groupBy([
                'roles.role_id',
                'roles.role_name',
                'roles.slug',
                'roles.description',
                'roles.is_system',
                'roles.domain_scope',
                'roles.is_active',
                'roles.assignable_by',
                'roles.permission_sync_mode',
                'roles.created_at',
                'roles.updated_at',
            ])
            .orderBy('roles.is_system', 'desc')
            .orderBy('roles.role_name', 'asc')
            .execute();
    }

    /**
     * Find a role by its numeric ID.
     */
    static async findRoleById(dbClient: DbClient, roleId: number) {
        return dbClient
            .selectFrom('roles')
            .selectAll()
            .where('role_id', '=', roleId)
            .executeTakeFirst();
    }

    /**
     * Find a role by its unique alphanumeric slug.
     */
    static async findRoleBySlug(dbClient: DbClient, slug: string) {
        return dbClient.selectFrom('roles').selectAll().where('slug', '=', slug).executeTakeFirst();
    }

    /**
     * Insert a new role record into the database.
     */
    static async createRole(
        dbClient: DbClient,
        data: {
            name: string;
            slug?: string | null;
            description?: string | null;
            domain_scope?: string[];
            is_active?: boolean;
            assignable_by?: string[];
            is_system?: boolean;
        },
    ) {
        return dbClient
            .insertInto('roles')
            .values({
                role_name: data.name,
                slug: data.slug || null,
                description: data.description || null,
                domain_scope: data.domain_scope || [],
                is_active: data.is_active ?? true,
                assignable_by: data.assignable_by || [],
                is_system: data.is_system ?? false,
            })
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    /**
     * Update an existing role record.
     */
    static async updateRole(
        dbClient: DbClient,
        roleId: number,
        data: {
            name?: string;
            slug?: string | null;
            description?: string | null;
            domain_scope?: string[];
            is_active?: boolean;
            assignable_by?: string[];
        },
    ) {
        return dbClient
            .updateTable('roles')
            .set({
                role_name: data.name,
                slug: data.slug,
                description: data.description,
                domain_scope: data.domain_scope,
                is_active: data.is_active,
                assignable_by: data.assignable_by,
                updated_at: new Date(),
            })
            .where('role_id', '=', roleId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    /**
     * Delete a role record from the database.
     */
    static async deleteRole(dbClient: DbClient, roleId: number) {
        await dbClient.deleteFrom('roles').where('role_id', '=', roleId).execute();
    }
}
