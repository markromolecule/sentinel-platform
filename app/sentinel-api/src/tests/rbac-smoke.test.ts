import { describe, expect, it } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { testWithDbClient } from '../lib/test-with-db-client';
import { getUserActivePermissions } from '../modules/security/permission/data/get-user-active-permissions';
import { requirePermission } from '../lib/permissions';

describe('RBAC End-to-End Smoke Test', () => {
    testWithDbClient(
        'should resolve permissions from db and protect routes dynamically',
        async ({ dbClient }) => {
            // 1. Create a test permission
            const permission = await dbClient
                .insertInto('rbac_permissions')
                .values({
                    permission_key: 'smoke-test:execute',
                    module_key: 'smoke-test',
                    action_key: 'execute',
                    name: 'Smoke Test Execute',
                    description: 'Allows executing smoke tests',
                    is_system: false,
                })
                .returningAll()
                .executeTakeFirstOrThrow();

            // 2. Create a test role
            const role = await dbClient
                .insertInto('roles')
                .values({
                    role_name: 'Smoke Test Role',
                    slug: 'smoke-test-role',
                    description: 'Role for smoke testing',
                    domain_scope: [],
                    is_active: true,
                    assignable_by: ['admin'],
                    is_system: false,
                })
                .returningAll()
                .executeTakeFirstOrThrow();

            // 3. Map permission to role
            await dbClient
                .insertInto('rbac_role_permissions')
                .values({
                    role_id: role.role_id,
                    permission_id: permission.permission_id,
                })
                .execute();

            // 4. Create a test user in auth schema
            const userId = '33333333-3333-3333-3333-333333333333';
            await dbClient
                .insertInto('auth.users' as any)
                .values({
                    id: userId,
                    email: 'smoke@sentinel.local',
                    role: 'authenticated',
                })
                .execute();

            // 5. Assign role to user
            await dbClient
                .insertInto('user_roles')
                .values({
                    user_id: userId,
                    role_id: role.role_id,
                })
                .execute();

            // 6. Assert getUserActivePermissions resolves correctly
            const activePermissions = await getUserActivePermissions(dbClient, userId);
            expect(activePermissions).toContain('smoke-test:execute');

            // 7. Verify route access protection
            const app = new OpenAPIHono();
            app.use('*', async (c, next) => {
                c.set('userId', userId);
                c.set('roleId', String(role.role_id));
                c.set('roleSlug', role.slug);
                c.set('activePermissionKeys', new Set(activePermissions));
                await next();
            });

            app.get('/test-smoke-route', requirePermission('smoke-test:execute'), (c) =>
                c.json({ success: true }),
            );

            app.get(
                '/test-smoke-route-forbidden',
                requirePermission('some:other-permission'),
                (c) => c.json({ success: true }),
            );

            const res1 = await app.request('/test-smoke-route');
            expect(res1.status).toBe(200);

            const res2 = await app.request('/test-smoke-route-forbidden');
            expect(res2.status).toBe(403);
        },
    );
});
