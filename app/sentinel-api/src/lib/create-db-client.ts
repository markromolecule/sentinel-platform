import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './types';

import * as dotenv from 'dotenv';
import * as dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

dotenv.config();

// We need to use pg module rather than postgres to ensure compatibility
// with typical connection pooling or direct connections when accelerate isn't used
const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        // Since we are connecting to Supabase with pooling, we might need these
        max: 10,
    }),
});

export const dbClient = new Kysely<DB>({
    dialect,
    // Add logs if you need to debug queries
    // log: process.env.NODE_ENV !== 'production' ? ['query', 'error'] : ['error']
});

export type DbClient = Kysely<DB>;
