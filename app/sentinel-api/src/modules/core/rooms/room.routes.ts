import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware, type AppBindings } from '../../../middleware/auth';
import { roleAuthMiddleware } from '../../../middleware/role-auth';

import { createRoomRoute, createRoomRouteHandler } from './controllers/create-room.controller';
import { getRoomsRoute, getRoomsRouteHandler } from './controllers/get-rooms.controller';
import { updateRoomRoute, updateRoomRouteHandler } from './controllers/update-room.controller';
import { deleteRoomRoute, deleteRoomRouteHandler } from './controllers/delete-room.controller';
import { deleteRoomsRoute, deleteRoomsRouteHandler } from './controllers/delete-rooms.controller';

const roomsRoutes = new OpenAPIHono<AppBindings>();

// Apply auth middleware to all room routes
roomsRoutes.use('*', authMiddleware);

// Apply role-based authorization: support role manages, others have limited access
roomsRoutes.use('/', (c, next) => {
    const allowedRoles =
        c.req.method === 'GET' ? ['support', 'superadmin', 'admin', 'instructor'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

roomsRoutes.use('/:id', (c, next) => {
    const allowedRoles =
        c.req.method === 'GET' ? ['support', 'superadmin', 'admin', 'instructor'] : ['support'];
    return roleAuthMiddleware(allowedRoles)(c, next);
});

roomsRoutes.use('/bulk-delete', (c, next) => {
    return roleAuthMiddleware(['support'])(c, next);
});

// Route Handlers
roomsRoutes
    .openapi(createRoomRoute, createRoomRouteHandler)
    .openapi(getRoomsRoute, getRoomsRouteHandler)
    .openapi(updateRoomRoute, updateRoomRouteHandler)
    .openapi(deleteRoomRoute, deleteRoomRouteHandler)
    .openapi(deleteRoomsRoute, deleteRoomsRouteHandler);

export default roomsRoutes;
