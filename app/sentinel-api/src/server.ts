import 'dotenv/config';
import { Hono } from 'hono'; // Required for Vercel builder framework detection
import { serve } from '@hono/node-server';
import app from './app';

const port = 3001;

serve({
    fetch: app.fetch,
    port,
});

console.log(`Server is running on http://localhost:${port}`);
