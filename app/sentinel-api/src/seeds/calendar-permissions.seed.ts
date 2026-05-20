import 'dotenv/config';
import { prisma } from '@sentinel/db';

async function seedCalendarPermissions() {
    console.log('🌱 Seeding calendar permissions...');

    const permissionsData = [
        {
            permission_key: 'calendar:view',
            module_key: 'calendar',
            action_key: 'view',
            category: 'COMMUNICATION',
            scope: 'institution',
            name: 'View Calendar Events',
            description: 'Access and review institutional calendar events and announcements.',
            is_system: true,
        },
        {
            permission_key: 'calendar:create',
            module_key: 'calendar',
            action_key: 'create',
            category: 'COMMUNICATION',
            scope: 'institution',
            name: 'Create Calendar Events',
            description: 'Add new events and announcements to the institutional calendar.',
            is_system: true,
        },
        {
            permission_key: 'calendar:update',
            module_key: 'calendar',
            action_key: 'update',
            category: 'COMMUNICATION',
            scope: 'institution',
            name: 'Update Calendar Events',
            description: 'Edit and manage existing institutional calendar events and announcements.',
            is_system: true,
        },
        {
            permission_key: 'calendar:delete',
            module_key: 'calendar',
            action_key: 'delete',
            category: 'COMMUNICATION',
            scope: 'institution',
            name: 'Delete Calendar Events',
            description: 'Remove events and announcements from the institutional calendar.',
            is_system: true,
        },
    ];

    const seededPermissions: Record<string, any> = {};

    for (const data of permissionsData) {
        const permission = await prisma.rbac_permissions.upsert({
            where: { permission_key: data.permission_key },
            update: {
                module_key: data.module_key,
                action_key: data.action_key,
                category: data.category,
                scope: data.scope,
                name: data.name,
                description: data.description,
                is_system: data.is_system,
                updated_at: new Date(),
            },
            create: data,
        });
        seededPermissions[data.permission_key] = permission;
        console.log(`Permission: ${data.permission_key} upserted.`);
    }

    // Role assignment mappings
    const roleMappings: Record<string, string[]> = {
        student: ['calendar:view'],
        instructor: ['calendar:view'],
        admin: ['calendar:view', 'calendar:create', 'calendar:update', 'calendar:delete'],
        superadmin: ['calendar:view', 'calendar:create', 'calendar:update', 'calendar:delete'],
        support: ['calendar:view', 'calendar:create', 'calendar:update', 'calendar:delete'],
    };

    for (const [roleName, permissionKeys] of Object.entries(roleMappings)) {
        const role = await prisma.roles.findUnique({
            where: { role_name: roleName },
        });

        if (!role) {
            console.warn(`⚠️ Role ${roleName} not found in database. Skipping assignments.`);
            continue;
        }

        for (const key of permissionKeys) {
            const permission = seededPermissions[key];
            if (!permission) continue;

            await prisma.rbac_role_permissions.upsert({
                where: {
                    role_id_permission_id: {
                        role_id: role.role_id,
                        permission_id: permission.permission_id,
                    },
                },
                update: {},
                create: {
                    role_id: role.role_id,
                    permission_id: permission.permission_id,
                },
            });
            console.log(`Linked permission ${key} to role ${roleName}.`);
        }
    }

    console.log('✅ Calendar permissions seeding completed successfully!');
}

seedCalendarPermissions()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
