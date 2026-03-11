import { db } from '../../../packages/db/src';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../packages/db/.env') });

async function main() {
    console.log('Fetching auth.users snippet...');
    const users = await db
        .selectFrom('auth.users as u')
        .select(['u.id', 'u.email', 'u.role', 'u.raw_user_meta_data'])
        .limit(2)
        .execute();
    console.log(JSON.stringify(users, null, 2));

    console.log('\nFetching user_roles snippet...');
    const userRoles = await db
        .selectFrom('user_roles as ur')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .select(['ur.user_id', 'r.role_name'])
        .limit(5)
        .execute();
    console.log(JSON.stringify(userRoles, null, 2));

    process.exit(0);
}

main().catch(console.error);
