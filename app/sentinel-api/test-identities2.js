const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../../.env' }); // Up to sentinel root where .env is

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const res = await pool.query('SELECT provider_id, last_sign_in_at FROM auth.identities LIMIT 10');
    fs.writeFileSync('identities-dump.json', JSON.stringify({ 
        identities: res.rows 
    }, null, 2));
    console.log('Dumped to identities-dump.json');
  } catch (e) {
    fs.writeFileSync('identities-dump-error.txt', e.toString());
  } finally {
    await pool.end();
  }
}
run();
