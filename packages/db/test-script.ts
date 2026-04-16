import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function checkDb() {
    try {
        const roles = await prisma.roles.findMany();
        console.log('Roles in DB:', roles);

        const firstSubject = await prisma.subjects.findFirst();
        console.log('Sample subject:', firstSubject);

        // Test the exact enroll instructor logic
        const role = roles.find((r) => r.role_name === 'Instructor');
        console.log('Instructor role found:', !!role);
    } catch (error) {
        console.error('DB Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
