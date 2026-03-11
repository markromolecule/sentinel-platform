import { Kysely, PostgresCollation, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust if needed

interface DB {
  'auth.sessions': {
    id: string;
    user_id: string;
    not_after: Date | null;
  }
}
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})
const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: pool
  })
});

async function run() {
  const result = await db
    .selectFrom('auth.sessions')
    .select(['id', 'user_id', 'not_after'])
    .execute();
  console.log('Sessions:', result);
  
  const now = await sql`SELECT now() as n`.execute(db);
  console.log('Now:', now.rows[0]);
  
  await db.destroy();
  await pool.end();
}

run().catch(console.error);
