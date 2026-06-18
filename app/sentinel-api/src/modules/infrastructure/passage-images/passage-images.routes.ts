import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    uploadPassageImageRoute,
    uploadPassageImageRouteHandler,
} from './passage-images.controller';

const passageImagesRoutes = new OpenAPIHono<HonoEnv>();

passageImagesRoutes.use('*', authMiddleware);
passageImagesRoutes.openapi(uploadPassageImageRoute, uploadPassageImageRouteHandler);

export default passageImagesRoutes;
