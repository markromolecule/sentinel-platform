import { dbClient } from '@sentinel/db';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // or wherever the db connection string is

async function test() {
    const records = await dbClient
        .selectFrom('auth.sessions as session')
        .select(['session.user_id', 'session.not_after'])
        .execute();
    console.log(records);
}

test().catch(console.error).finally(() => process.exit(0));
