import { PrismaClient } from './generated/client/index.js';
const prisma = new PrismaClient();
async function main() {
    const sections = await prisma.sections.findMany({ take: 5 });
    console.log('Sections:', sections);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
