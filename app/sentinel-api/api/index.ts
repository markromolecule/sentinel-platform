import { handle } from '@hono/node-server/vercel';
import app from '../src/app';

// Vercel Serverless Function - Handles the polymorphic request/response objects
export default handle(app);

