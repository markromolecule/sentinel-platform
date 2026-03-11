import { db } from '@sentinel/db';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const res = await db.selectFrom('auth.users').select(['id', 'email', 'role', 'raw_user_meta_data']).limit(5).execute();
    console.log(JSON.stringify(res, null, 2));
}
main();
