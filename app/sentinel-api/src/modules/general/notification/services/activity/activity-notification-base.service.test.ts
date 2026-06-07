import { describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import {
    getUserPrimaryRole,
    getRecipientRolesForActorRole,
    resolveInstitutionLevel,
} from './activity-notification-base.service';

type FakeBuilderResult = {
    execute?: any[];
    executeTakeFirst?: any;
};

function createFakeBuilder(result: FakeBuilderResult) {
    return {
        innerJoin() {
            return this;
        },
        select() {
            return this;
        },
        where() {
            return this;
        },
        orderBy() {
            return this;
        },
        async execute() {
            return result.execute ?? [];
        },
        async executeTakeFirst() {
            return result.executeTakeFirst;
        },
    };
}

function createFakeDbClient(results: FakeBuilderResult[]) {
    const queue = [...results];
    return {
        selectFrom: vi.fn(() => {
            const next = queue.shift();
            if (!next) {
                throw new Error('Unexpected selectFrom call');
            }
            return createFakeBuilder(next);
        }),
    } as any;
}

describe('activity-notification-base.service unit tests', () => {
    describe('getUserPrimaryRole', () => {
        it('resolves the primary role using the database query', async () => {
            const dbClient = createFakeDbClient([
                {
                    execute: [{ roleName: 'admin' }, { roleName: 'instructor' }],
                },
            ]);

            const role = await getUserPrimaryRole(dbClient, 'user-1');
            expect(role).toBe('admin');
            expect(dbClient.selectFrom).toHaveBeenCalledWith('user_roles as ur');
        });

        it('returns null if the user has no assigned roles', async () => {
            const dbClient = createFakeDbClient([
                {
                    execute: [],
                },
            ]);

            const role = await getUserPrimaryRole(dbClient, 'user-2');
            expect(role).toBeNull();
        });
    });

    describe('getRecipientRolesForActorRole', () => {
        it('loads dynamic routing from system_settings if present', async () => {
            const dbClient = createFakeDbClient([
                {
                    executeTakeFirst: {
                        setting_value: {
                            admin: ['superadmin'],
                            default: ['admin'],
                        },
                    },
                },
            ]);

            const recipients = await getRecipientRolesForActorRole(dbClient, 'admin');
            expect(recipients).toEqual(['superadmin']);
            expect(dbClient.selectFrom).toHaveBeenCalledWith('system_settings');
        });

        it('falls back to default routing if system_settings is missing', async () => {
            const dbClient = createFakeDbClient([
                {
                    executeTakeFirst: null,
                },
            ]);

            const recipients = await getRecipientRolesForActorRole(dbClient, 'admin');
            expect(recipients).toEqual(['support', 'superadmin', 'admin', 'instructor']);
        });

        it('falls back to default routing on query failure', async () => {
            const dbClient = {
                selectFrom: vi.fn(() => {
                    throw new Error('Database down');
                }),
            } as any;

            const recipients = await getRecipientRolesForActorRole(dbClient, 'support');
            expect(recipients).toEqual(['admin', 'superadmin']);
        });
    });

    describe('resolveInstitutionLevel', () => {
        it('resolves to ADMIN_OVERRIDE if override flag is true', () => {
            const res = resolveInstitutionLevel({
                actorRole: 'admin',
                isAdminOverride: true,
            });
            expect(res).toBe('ADMIN_OVERRIDE');
        });

        it('resolves to PARENT_INSTITUTION if cross-tenant permission is active', () => {
            const activePermissionKeys = new Set(['institutions:cross-tenant-view']);
            const res = resolveInstitutionLevel({
                actorRole: 'instructor',
                isAdminOverride: false,
                activePermissionKeys,
            });
            expect(res).toBe('PARENT_INSTITUTION');
        });

        it('falls back to role string checks if activePermissionKeys is missing', () => {
            const res1 = resolveInstitutionLevel({
                actorRole: 'superadmin',
                isAdminOverride: false,
            });
            expect(res1).toBe('PARENT_INSTITUTION');

            const res2 = resolveInstitutionLevel({
                actorRole: 'instructor',
                isAdminOverride: false,
            });
            expect(res2).toBe('BRANCH_INSTITUTION');
        });
    });
});
