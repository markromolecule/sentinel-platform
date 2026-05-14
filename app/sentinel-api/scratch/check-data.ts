import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.khcnxdmiyyzgbafjprff:%40Silvallana02@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"
        }
    }
});

async function main() {
    console.log('--- SECTIONS WITH DEPARTMENT AND COURSE ---');
    const sections = await prisma.sections.findMany({
        include: {
            departments: true,
            courses: true
        },
        take: 10
    });
    
    sections.forEach(s => {
        console.log(`Section: ${s.section_name}`);
        console.log(`  Dept ID: ${s.department_id} -> Name: ${s.departments?.department_name} (Code: ${s.departments?.department_code})`);
        console.log(`  Course ID: ${s.course_id} -> Title: ${s.courses?.title}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
