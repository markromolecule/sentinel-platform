import { prisma } from '../src';

async function main() {
    console.log('Finding user josephdump6@gmail.com...');
    const user = await prisma.users.findFirst({
        where: { email: 'josephdump6@gmail.com' },
    });

    if (!user) {
        console.log('User not found.');
        return;
    }

    console.log(`User ID: ${user.id}`);

    // Delete role_id: 5 (superadmin) and role_id: 3 (student) assignments
    const deleteCount = await prisma.user_roles.deleteMany({
        where: {
            user_id: user.id,
            role_id: {
                in: [3, 5],
            },
        },
    });

    console.log(`Deleted ${deleteCount.count} erroneous assignment(s).`);

    // Verify current assignments
    const currentRoles = await prisma.user_roles.findMany({
        where: { user_id: user.id },
        include: { roles: true },
    });

    console.log('Remaining assignments:', currentRoles.map(ur => ({
        role_id: ur.role_id,
        role_name: ur.roles.role_name,
        assigned_at: ur.assigned_at,
    })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
