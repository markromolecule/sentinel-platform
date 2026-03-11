import { prisma } from './src';

async function main() {
    console.log('Fetching users and their user_profiles...');
    const users = await prisma.users.findMany({
        include: {
            user_profiles: true,
        },
    });

    for (const u of users) {
        let metaRole = null;
        if (u.raw_user_meta_data) {
            try {
                if (typeof u.raw_user_meta_data === 'string') {
                    metaRole = JSON.parse(u.raw_user_meta_data).role;
                } else {
                    metaRole = (u.raw_user_meta_data as any).role;
                }
            } catch (e) {}
        }
        
        console.log(`User: ${u.email} | ID: ${u.id}`);
        console.log(`Meta Role: ${metaRole}`);
        if (u.user_profiles) {
            console.log(`Institution ID: "${u.user_profiles.institution_id}"`);
        } else {
            console.log(`No user_profiles record`);
        }
        console.log('---');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
