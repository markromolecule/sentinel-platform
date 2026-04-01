import 'dotenv/config';

import { prisma } from '@sentinel/db';
import { getSupabaseAdmin } from '../src/lib/supabase-admin';

const SUPPORT_EMAIL = 'support@sentinelph.tech';
const SUPPORT_PASSWORD = '@Livado02';
const SUPPORT_METADATA = {
    first_name: 'Sentinel',
    last_name: 'Support',
    role: 'support',
};

async function ensureSupportAccount() {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
        throw new Error(
            'Supabase Admin client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        );
    }

    const supportRole = await prisma.roles.upsert({
        where: { role_name: 'support' },
        update: {},
        create: { role_name: 'support' },
    });

    const existingAuthUser = await prisma.users.findFirst({
        where: { email: SUPPORT_EMAIL },
        select: { id: true },
    });

    let userId = existingAuthUser?.id;

    if (!userId) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: SUPPORT_EMAIL,
            password: SUPPORT_PASSWORD,
            email_confirm: true,
            user_metadata: SUPPORT_METADATA,
            app_metadata: { role: 'support' },
        });

        if (error || !data?.user) {
            throw new Error(error?.message || 'Failed to create support auth user.');
        }

        userId = data.user.id;
    } else {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email: SUPPORT_EMAIL,
            password: SUPPORT_PASSWORD,
            email_confirm: true,
            user_metadata: SUPPORT_METADATA,
            app_metadata: { role: 'support' },
        });

        if (error) {
            throw new Error(error.message || 'Failed to update support auth user.');
        }
    }

    await prisma.$transaction(async (tx) => {
        await tx.user_roles.deleteMany({
            where: { user_id: userId },
        });

        await tx.user_roles.create({
            data: {
                user_id: userId!,
                role_id: supportRole.role_id,
            },
        });

        await tx.user_profiles.upsert({
            where: { user_id: userId! },
            update: {
                first_name: 'Sentinel',
                last_name: 'Support',
                institution_id: null,
                department_id: null,
                course_id: null,
                status: 'ACTIVE',
                updated_at: new Date(),
            },
            create: {
                user_id: userId!,
                first_name: 'Sentinel',
                last_name: 'Support',
                institution_id: null,
                department_id: null,
                course_id: null,
                status: 'ACTIVE',
            },
        });

        await tx.students.deleteMany({
            where: { user_id: userId },
        });

        await tx.instructors.deleteMany({
            where: { user_id: userId },
        });
    });

    console.log(`Support account ready: ${SUPPORT_EMAIL}`);
}

ensureSupportAccount()
    .catch((error) => {
        console.error('Support seed failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
