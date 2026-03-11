import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../packages/db/.env') });

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    console.log('Fetching auth.users snippet...');
    const res = await client.query(
        'SELECT id, email, role, raw_user_meta_data FROM auth.users LIMIT 5',
    );
    console.log(JSON.stringify(res.rows, null, 2));

    await client.end();
}

main().catch(console.error);
