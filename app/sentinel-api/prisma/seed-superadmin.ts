import 'dotenv/config';
import { prisma } from '@sentinel/db';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createSuperadminAccount(email: string, password: string = 'superadmin123') {
    console.log(`Checking if superadmin ${email} exists in DB...`);
    let dbUser = await prisma.users.findFirst({
        where: { email },
        select: { id: true },
    });

    if (!dbUser) {
        console.log(`Creating superadmin in Supabase Auth...`);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { role: 'superadmin' } },
        });

        if (error && error.message !== 'User already registered') {
            console.error(`Error creating superadmin (${email}):`, error.message);
            return;
        } else if (!error && data.user) {
            console.log(`Created user ${email} with ID: ${data.user.id}`);
        } else {
            console.log(`User ${email} already exists in Supabase.`);
        }

        dbUser = await prisma.users.findFirst({
            where: { email },
            select: { id: true },
        });
    }

    if (!dbUser) {
        console.warn(
            'Superadmin user not yet visible in users table. Supabase Auth trigger might be delayed or failed.',
        );
        return;
    }

    console.log(`Enabling user ${email}...`);
    await prisma.users.update({
        where: { id: dbUser.id },
        data: {
            email_confirmed_at: new Date(),
            role: 'authenticated', // Superadmin role in app might be different from Supabase user role, but usually authenticated
            confirmation_token: '',
            confirmation_sent_at: null,
        },
    });

    // We assume role_id for superadmin is 0 or handled specially. Wait, let's see if there's a superadmin role in DB
    const superAdminRole = await prisma.roles.findFirst({
        where: { role_name: 'superadmin' },
    });

    let roleId = superAdminRole?.role_id;
    if (!roleId) {
        // Find maximum role ID to create a new one, or set it to a specific value like 4
        const newRole = await prisma.roles
            .upsert({
                where: { role_name: 'superadmin' } as any, // Wait, might need to make sure role can be created
                update: {},
                create: { role_id: 5, role_name: 'superadmin' } as any, // Prisma creates usually ID serial, but just insert
            })
            .catch(async (e) => {
                console.log('Upsert failed, getting latest role id');
                const latest = await prisma.roles.findFirst({ orderBy: { role_id: 'desc' } });
                return await prisma.roles.create({
                    data: { role_name: 'superadmin', role_id: (latest?.role_id || 3) + 1 } as any,
                });
            });
        roleId = newRole.role_id;
    }

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

    await prisma.user_profiles.upsert({
        where: { user_id: dbUser.id },
        update: {},
        create: {
            user_id: dbUser.id,
            first_name: 'Super',
            last_name: 'Admin',
        },
    });

    console.log('Superadmin creation complete.');
}

async function main() {
    await prisma.$connect();
    console.log('Starting seed for superadmin...');

    const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@sentinel.com';
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'password123';

    await createSuperadminAccount(superAdminEmail, superAdminPassword);

    console.log('Superadmin seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
