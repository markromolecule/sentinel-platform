import 'dotenv/config';

import { prisma } from '@sentinel/db';
import { supabaseAdmin } from '../src/lib/supabase-admin';

async function updateSupportPassword() {
    const email = 'support@sentinelph.tech';
    const newPassword = '@Livado02';

    console.log(`Updating password for ${email}...`);

    const existingUser = await prisma.users.findFirst({
        where: { email },
        select: { id: true },
    });

    if (!existingUser) {
        throw new Error(`User not found with email: ${email}`);
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: newPassword,
    });

    if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
    }

    console.log(`Successfully updated password for ${email} using Supabase Admin API!`);
}

updateSupportPassword()
    .catch((error) => {
        console.error('Password update failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
