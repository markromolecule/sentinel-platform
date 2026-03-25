import app from '../src/app';

// Use Hono's native Web API fetch handler directly.
// Vercel's Node.js 18+ runtime supports Web API Request/Response natively,
// so bypassing @hono/node-server/vercel avoids any request-body stream
// conversion issues that cause POST/PATCH bodies to hang.
const handler = (req: Request) => app.fetch(req);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;

export default handler;
