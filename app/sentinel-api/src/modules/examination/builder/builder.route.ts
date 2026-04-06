import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '@/middleware/auth';
import { type HonoEnv } from '@/types/hono';
import {
    getBuilderWorkspaceRoute,
    getBuilderWorkspaceRouteHandler,
} from './controllers/get-builder-workspace.controller';
import {
    publishBuilderWorkspaceRoute,
    publishBuilderWorkspaceRouteHandler,
} from './controllers/publish-builder-workspace.controller';
import {
    saveBuilderWorkspaceRoute,
    saveBuilderWorkspaceRouteHandler,
} from './controllers/save-builder-workspace.controller';

const builderRoutes = new OpenAPIHono<HonoEnv>();

builderRoutes.use('*', authMiddleware);

builderRoutes
    .openapi(getBuilderWorkspaceRoute, getBuilderWorkspaceRouteHandler)
    .openapi(saveBuilderWorkspaceRoute, saveBuilderWorkspaceRouteHandler)
    .openapi(publishBuilderWorkspaceRoute, publishBuilderWorkspaceRouteHandler);

export default builderRoutes;
