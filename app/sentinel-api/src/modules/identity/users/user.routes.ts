import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import { authMiddleware } from '../../../middleware/auth';

import { createUserRoute, createUserRouteHandler } from './controllers/create-user.controller';
import { inviteUserRoute, inviteUserRouteHandler } from './controllers/invite-user.controller';
import { getUsersRoute, getUsersRouteHandler } from './controllers/get-users.controller';
import { getUserRoute, getUserRouteHandler } from './controllers/get-user.controller';
import { updateUserRoute, updateUserRouteHandler } from './controllers/update-user.controller';
import { deleteUserRoute, deleteUserRouteHandler } from './controllers/delete-user.controller';

const usersRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all user routes
usersRoutes.use('*', authMiddleware);

// Traffic Director
usersRoutes
    .openapi(createUserRoute, createUserRouteHandler)
    .openapi(getUsersRoute, getUsersRouteHandler)
    .openapi(getUserRoute, getUserRouteHandler)
    .openapi(updateUserRoute, updateUserRouteHandler)
    .openapi(deleteUserRoute, deleteUserRouteHandler)
    .openapi(inviteUserRoute, inviteUserRouteHandler);

export default usersRoutes;
