const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../../.env' }); // Up to sentinel root where .env is

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const timeRes = await pool.query('SELECT now()');
    const res = await pool.query('SELECT * FROM auth.sessions LIMIT 10');
    fs.writeFileSync('sessions-dump.json', JSON.stringify({ 
        now: timeRes.rows[0], 
        sessions: res.rows 
    }, null, 2));
    console.log('Dumped to sessions-dump.json');
  } catch (e) {
    fs.writeFileSync('sessions-dump-error.txt', e.toString());
  } finally {
    await pool.end();
  }
}
run();
