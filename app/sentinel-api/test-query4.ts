import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '../../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

async function run() {
  const result = await pool.query('SELECT count(*) as total, sum(case when not_after > now() then 1 else 0 end) as active FROM auth.sessions');
  const userStats = await pool.query('SELECT user_id, count(*) as active FROM auth.sessions WHERE not_after > now() GROUP BY user_id LIMIT 5');
  
  const text = `Total sessions: ${result.rows[0].total}\nActive sessions: ${result.rows[0].active}\nSample active users: ${JSON.stringify(userStats.rows)}`;
  fs.writeFileSync('db-test-output.txt', text);
  
  await pool.end();
}

run().catch(e => fs.writeFileSync('db-test-error.txt', e.message));
