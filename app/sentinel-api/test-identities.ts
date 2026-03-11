import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust if needed

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
  const result = await pool.query('SELECT provider_id, last_sign_in_at FROM auth.identities LIMIT 5');
  console.log('Identities:', result.rows);
  
  await pool.end();
}

run().catch(console.error);
