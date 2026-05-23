import 'dotenv/config';
import { prisma } from '@sentinel/db';

async function seedMessagesPermissions() {
    console.log('🌱 Seeding messages permissions...');

    const permissionsData = [
        {
            permission_key: 'messages:view',
            module_key: 'messages',
            action_key: 'view',
            category: 'COMMUNICATION',
            scope: 'self',
            name: 'View Messages',
            description: 'Read and view direct messages and conversations.',
            is_system: true,
        },
        {
            permission_key: 'messages:create',
            module_key: 'messages',
            action_key: 'create',
            category: 'COMMUNICATION',
            scope: 'self',
            name: 'Create Messages',
            description: 'Start new direct conversations and send messages.',
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
        student: ['messages:view', 'messages:create'],
        instructor: ['messages:view', 'messages:create'],
        proctor: ['messages:view', 'messages:create'],
        disciplinary_officer: ['messages:view', 'messages:create'],
        admin: ['messages:view', 'messages:create'],
        superadmin: ['messages:view', 'messages:create'],
        support: ['messages:view', 'messages:create'],
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

    console.log('✅ Messages permissions seeding completed successfully!');
}

seedMessagesPermissions()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
