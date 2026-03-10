import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../types/hono';
import { authMiddleware } from '../../middleware/auth';

const usersRoutes = new OpenAPIHono<HonoEnv>();

usersRoutes.use('*', authMiddleware);

export default usersRoutes;
