import { prisma } from '../src';

async function main() {
    console.log('Querying roles and assignments for josephdump6@gmail.com...');
    
    // Find the user by email
    const user = await prisma.users.findFirst({
        where: {
            email: 'josephdump6@gmail.com',
        },
    });

    if (!user) {
        console.log('User josephdump6@gmail.com not found.');
        return;
    }

    console.log(`Found user: ID = ${user.id}, Email = ${user.email}`);

    // Get all user_roles for this user
    const userRoles = await prisma.user_roles.findMany({
        where: {
            user_id: user.id,
        },
        include: {
            roles: true,
        },
    });

    console.log(`User roles assigned:`, userRoles.map(ur => ({
        role_id: ur.role_id,
        role_name: ur.roles.role_name,
        assigned_at: ur.assigned_at,
    })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
