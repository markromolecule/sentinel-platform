import 'dotenv/config';
import { prisma } from '../src/lib/db';
import { createClient } from '@supabase/supabase-js';

console.log('Database URL:', process.env.DATABASE_URL);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type SeedAuthUserArgs = {
    email: string;
    password: string;
    appRole: 'admin' | 'proctor' | 'student';
    roleId: number;
};

async function ensureSeedAuthUser({ email, password, appRole, roleId }: SeedAuthUserArgs) {
    let dbUser = await prisma.users.findFirst({
        where: { email },
        select: { id: true },
    });

    if (!dbUser) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { role: appRole } },
        });

        if (error && error.message !== 'User already registered') {
            console.error(`Error creating ${appRole} user (${email}):`, error.message);
        } else if (!error && data.user) {
            console.log(`Created user ${email} with ID: ${data.user.id}`);
        } else {
            console.log(`User ${email} already exists.`);
        }

        dbUser = await prisma.users.findFirst({
            where: { email },
            select: { id: true },
        });
    }

    if (!dbUser) {
        console.warn(`${appRole} user not yet visible in auth.users; skipping role assignment.`);
        return null;
    }

    await prisma.users.update({
        where: { id: dbUser.id },
        data: {
            email_confirmed_at: new Date(),
            role: 'authenticated',
            confirmation_token: '',
            confirmation_sent_at: null,
        },
    });

    // Remove stale one-time tokens to avoid auth state mismatches for seeded users.
    await prisma.one_time_tokens.deleteMany({
        where: { user_id: dbUser.id },
    });

    await prisma.user_roles.upsert({
        where: {
            user_id_role_id: {
                user_id: dbUser.id,
                role_id: roleId,
            },
        },
        update: {},
        create: {
            user_id: dbUser.id,
            role_id: roleId,
        },
    });

    console.log(`${appRole} role assigned.`);
    return dbUser.id;
}

async function main() {
    await prisma.$connect();
    console.log('Starting seed...');

    // 1. Seed Roles
    const roles = [
        { role_id: 1, role_name: 'admin' },
        { role_id: 2, role_name: 'proctor' },
        { role_id: 3, role_name: 'student' },
    ];

    for (const role of roles) {
        await prisma.roles.upsert({
            where: { role_id: role.role_id },
            update: { role_name: role.role_name },
            create: role,
        });
    }
    console.log('Roles seeded.');

    // 2. Seed Departments
    const departments = [
        { name: 'School of Arts, Sciences, and Education', code: 'SASE' },
        { name: 'School of Engineering, Computing, and Architecture', code: 'SECA' },
        { name: 'Senior High School', code: 'SHS' },
        { name: 'School of Business, Management, and Accountancy', code: 'SBMA' },
    ];

    for (const dept of departments) {
        const existing = await prisma.departments.findFirst({
            where: { department_name: dept.name },
        });

        if (!existing) {
            await prisma.departments.create({
                data: {
                    department_name: dept.name,
                    department_code: dept.code,
                    created_at: new Date(),
                },
            });
        }
    }
    console.log('Departments seeded.');

    // 3. Create Admin User
    const adminEmail = 'admin@sentinel.com';
    const adminPassword = 'password123';
    const adminUserId = await ensureSeedAuthUser({
        email: adminEmail,
        password: adminPassword,
        appRole: 'admin',
        roleId: 1,
    });

    // 4. Create Proctor User (Optional)
    const proctorEmail = 'proctor@sentinel.com';
    const proctorPassword = 'password123';
    const proctorUserId = await ensureSeedAuthUser({
        email: proctorEmail,
        password: proctorPassword,
        appRole: 'proctor',
        roleId: 2,
    });

    // Resolve known users for created_by / updated_by fields
    const actorUserId = adminUserId ?? proctorUserId ?? null;

    // 5. Seed Courses
    const allDepartments = await prisma.departments.findMany({
        select: {
            department_id: true,
            department_code: true,
        },
    });

    const departmentMap = new Map(
        allDepartments.map((department) => [department.department_code, department.department_id]),
    );

    const coursesToSeed = [
        {
            code: 'BSIT-MWA',
            title: 'Bachelor of Science in Information Technology - Mobile Web Applications',
            departmentCode: 'SECA',
            description: 'IT program focused on mobile and web systems.',
        },
        {
            code: 'BSCS',
            title: 'Bachelor of Science in Computer Science',
            departmentCode: 'SECA',
            description: 'Core computer science and software engineering program.',
        },
        {
            code: 'BSBA',
            title: 'Bachelor of Science in Business Administration',
            departmentCode: 'SBMA',
            description: 'Business management and administration program.',
        },
    ];

    for (const course of coursesToSeed) {
        const departmentId = departmentMap.get(course.departmentCode) ?? null;

        await prisma.courses.upsert({
            where: { code: course.code },
            update: {
                title: course.title,
                department_id: departmentId,
                description: course.description,
                updated_by: actorUserId,
                updated_at: new Date(),
            },
            create: {
                code: course.code,
                title: course.title,
                department_id: departmentId,
                description: course.description,
                created_by: actorUserId,
                updated_by: actorUserId,
            },
        });
    }
    console.log('Courses seeded.');

    // 6. Seed Sections (BSIT-MWA + BSCS under SECA)
    const seca = await prisma.departments.findFirst({
        where: { department_code: 'SECA' },
    });
    const bsitMwa = await prisma.courses.findFirst({
        where: { code: 'BSIT-MWA' },
    });

    if (seca && bsitMwa) {
        const bsitMwaSections = [
            { section_name: 'INF-231', year_level: 2 },
            { section_name: 'INF-232', year_level: 2 },
            { section_name: 'INF-233', year_level: 2 },
            { section_name: 'INF-234', year_level: 2 },
            { section_name: 'INF-235', year_level: 2 },
            { section_name: 'INF-236', year_level: 2 },
        ];

        for (const section of bsitMwaSections) {
            const existing = await prisma.sections.findFirst({
                where: {
                    section_name: section.section_name,
                    department_id: seca.department_id,
                },
            });
            if (!existing) {
                await prisma.sections.create({
                    data: {
                        section_name: section.section_name,
                        department_id: seca.department_id,
                        course_id: bsitMwa.course_id,
                        year_level: section.year_level,
                        created_at: new Date(),
                        created_by: actorUserId,
                        updated_by: actorUserId,
                    },
                });
                console.log(`Section ${section.section_name} created.`);
            } else {
                console.log(`Section ${section.section_name} already exists. Skipping.`);
            }
        }
        console.log('BSIT-MWA sections seeded.');
    } else {
        console.warn('SECA department or BSIT-MWA course not found. Skipping section seeding.');
    }

    const bscs = await prisma.courses.findFirst({
        where: { code: 'BSCS' },
    });

    if (seca && bscs) {
        const bscsSections = [
            { section_name: 'CS-101A', year_level: 1 },
            { section_name: 'CS-102A', year_level: 1 },
            { section_name: 'CS-201A', year_level: 2 },
        ];

        for (const section of bscsSections) {
            const existing = await prisma.sections.findFirst({
                where: {
                    section_name: section.section_name,
                    department_id: seca.department_id,
                },
            });

            if (!existing) {
                await prisma.sections.create({
                    data: {
                        section_name: section.section_name,
                        department_id: seca.department_id,
                        course_id: bscs.course_id,
                        year_level: section.year_level,
                        created_at: new Date(),
                        created_by: actorUserId,
                        updated_by: actorUserId,
                    },
                });
                console.log(`Section ${section.section_name} created.`);
            }
        }
    }

    // 7. Seed Subjects (single + multi assignments)
    const sbma = await prisma.departments.findFirst({
        where: { department_code: 'SBMA' },
    });
    const bsba = await prisma.courses.findFirst({
        where: { code: 'BSBA' },
    });

    const allSections = await prisma.sections.findMany({
        select: {
            section_id: true,
            section_name: true,
            course_id: true,
            year_level: true,
        },
    });

    const sectionByName = new Map(allSections.map((section) => [section.section_name, section]));

    const subjectsToSeed = [
        {
            code: 'IT-101',
            title: 'IT Fundamentals',
            departmentCodes: ['SECA'],
            courseCodes: ['BSIT-MWA'],
            sectionNames: ['INF-231'],
            yearLevels: [2],
        },
        {
            code: 'CS-201',
            title: 'Data Structures and Algorithms',
            departmentCodes: ['SECA'],
            courseCodes: ['BSCS', 'BSIT-MWA'],
            sectionNames: ['CS-201A', 'INF-232', 'INF-233'],
            yearLevels: [2],
        },
        {
            code: 'GEN-101',
            title: 'Communication Skills',
            departmentCodes: ['SECA', 'SBMA'],
            courseCodes: ['BSCS', 'BSIT-MWA', 'BSBA'],
            sectionNames: ['CS-101A', 'CS-102A', 'INF-234'],
            yearLevels: [1, 2],
        },
    ];

    const courses = await prisma.courses.findMany({
        select: {
            course_id: true,
            code: true,
        },
    });
    const courseByCode = new Map(courses.map((course) => [course.code, course.course_id]));

    for (const subject of subjectsToSeed) {
        const seededSubject = await prisma.subjects.upsert({
            where: { subject_code: subject.code },
            update: {
                subject_title: subject.title,
                updated_by: actorUserId,
                updated_at: new Date(),
            },
            create: {
                subject_code: subject.code,
                subject_title: subject.title,
                created_by: actorUserId,
                updated_by: actorUserId,
            },
            select: {
                subject_id: true,
            },
        });

        const departmentIds = subject.departmentCodes
            .map((code) => departmentMap.get(code) ?? null)
            .filter((value): value is string => Boolean(value));

        const courseIds = subject.courseCodes
            .map((code) => courseByCode.get(code) ?? null)
            .filter((value): value is string => Boolean(value));

        const sectionIds = subject.sectionNames
            .map((name) => sectionByName.get(name)?.section_id ?? null)
            .filter((value): value is string => Boolean(value));

        await prisma.subject_departments.deleteMany({
            where: {
                subject_id: seededSubject.subject_id,
            },
        });

        if (departmentIds.length > 0) {
            await prisma.subject_departments.createMany({
                data: departmentIds.map((departmentId) => ({
                    subject_id: seededSubject.subject_id,
                    department_id: departmentId,
                })),
                skipDuplicates: true,
            });
        }

        await prisma.course_subjects.deleteMany({
            where: {
                subject_id: seededSubject.subject_id,
            },
        });

        if (courseIds.length > 0) {
            await prisma.course_subjects.createMany({
                data: courseIds.map((courseId) => ({
                    subject_id: seededSubject.subject_id,
                    course_id: courseId,
                    semester: null,
                    year_level: null,
                })),
                skipDuplicates: true,
            });
        }

        await prisma.subject_sections.deleteMany({
            where: {
                subject_id: seededSubject.subject_id,
            },
        });

        if (sectionIds.length > 0) {
            await prisma.subject_sections.createMany({
                data: sectionIds.map((sectionId) => ({
                    subject_id: seededSubject.subject_id,
                    section_id: sectionId,
                })),
                skipDuplicates: true,
            });
        }

        await prisma.subject_year_levels.deleteMany({
            where: {
                subject_id: seededSubject.subject_id,
            },
        });

        if (subject.yearLevels.length > 0) {
            await prisma.subject_year_levels.createMany({
                data: subject.yearLevels.map((yearLevel) => ({
                    subject_id: seededSubject.subject_id,
                    year_level: yearLevel,
                })),
                skipDuplicates: true,
            });
        }

        console.log(`Subject ${subject.code} seeded.`);
    }

    if (!sbma || !bsba) {
        console.warn('SBMA/BSBA not found; multi-department subject assignment may be partial.');
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
