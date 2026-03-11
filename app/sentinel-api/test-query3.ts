import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust if needed

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
  const result = await pool.query('SELECT id, user_id, not_after FROM auth.sessions LIMIT 5');
  console.log('Sessions:', result.rows);
  
  const now = await pool.query('SELECT now() as n');
  console.log('Now:', now.rows[0]);
  
  await pool.end();
}

run().catch(console.error);
