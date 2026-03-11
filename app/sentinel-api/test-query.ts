import { Kysely, PostgresCollation, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust if needed

// Simplified DB type just for auth.sessions test
interface DB {
  'auth.sessions': {
    id: string;
    user_id: string;
    not_after: Date | null;
  }
}

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  })
});

async function run() {
  const result = await db
    .selectFrom('auth.sessions')
    .select(['id', 'user_id', 'not_after'])
    .execute();
  console.log('Sessions:', result);
  await db.destroy();
}

run().catch(console.error);
