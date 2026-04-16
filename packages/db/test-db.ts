import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.roles.findMany();
    console.log('Roles:', roles);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
