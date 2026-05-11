import 'dotenv/config';

import { prisma } from '@sentinel/db';
import { DEFAULT_AUDIO_ANOMALY_CONFIG, SUPPORT_EMAIL } from '@sentinel/shared';

import { getSupabaseAdmin } from '../src/lib/supabase-admin';

const SUPPORT_ACCOUNT_EMAIL = process.env.SUPPORT_ACCOUNT_EMAIL || SUPPORT_EMAIL;
const SUPPORT_ACCOUNT_PASSWORD = process.env.SUPPORT_ACCOUNT_PASSWORD;
const SUPPORT_METADATA = {
    first_name: 'Sentinel',
    last_name: 'Support',
    role: 'support',
};

const requireSupportPassword = () => {
    if (!SUPPORT_ACCOUNT_PASSWORD) {
        throw new Error(
            'Missing SUPPORT_ACCOUNT_PASSWORD. Add it to your local app/sentinel-api/.env before running prisma db seed.',
        );
    }

    return SUPPORT_ACCOUNT_PASSWORD;
};

async function ensureSupportAccount() {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
        throw new Error(
            'Supabase Admin client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        );
    }

    const supportPassword = requireSupportPassword();

    const supportRole = await prisma.roles.upsert({
        where: { role_name: 'support' },
        update: {},
        create: { role_name: 'support' },
    });

    const existingAuthUser = await prisma.users.findFirst({
        where: { email: SUPPORT_ACCOUNT_EMAIL },
        select: { id: true },
    });

    let userId = existingAuthUser?.id;

    if (!userId) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: SUPPORT_ACCOUNT_EMAIL,
            password: supportPassword,
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
            email: SUPPORT_ACCOUNT_EMAIL,
            password: supportPassword,
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

    console.log(`Support account ready: ${SUPPORT_ACCOUNT_EMAIL}`);

    await prisma.system_settings.upsert({
        where: { setting_key: 'audio_anomaly_config' },
        update: {
            category: 'audio',
            description: 'Global audio anomaly detection calibration for student exam monitoring.',
            setting_value: {
                ...DEFAULT_AUDIO_ANOMALY_CONFIG,
                thresholds: { ...DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds },
                enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
            } as any,
            updated_by: userId ?? null,
            updated_at: new Date(),
        },
        create: {
            category: 'audio',
            setting_key: 'audio_anomaly_config',
            description: 'Global audio anomaly detection calibration for student exam monitoring.',
            setting_value: {
                ...DEFAULT_AUDIO_ANOMALY_CONFIG,
                thresholds: { ...DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds },
                enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
            } as any,
            updated_by: userId ?? null,
            updated_at: new Date(),
        },
    });

    console.log('Audio anomaly settings seeded.');
}

ensureSupportAccount()
    .catch((error) => {
        console.error('Support seed failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
