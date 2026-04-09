import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import {
    createAccessControlPermissionRoute,
    createAccessControlPermissionRouteHandler,
} from './controllers/create-access-control-permission.controller';
import {
    deleteAccessControlPermissionRoute,
    deleteAccessControlPermissionRouteHandler,
} from './controllers/delete-access-control-permission.controller';
import {
    getAccessControlPermissionsRoute,
    getAccessControlPermissionsRouteHandler,
} from './controllers/get-access-control-permissions.controller';
import {
    updateAccessControlPermissionRoute,
    updateAccessControlPermissionRouteHandler,
} from './controllers/update-access-control-permission.controller';

const permissionRoutes = new OpenAPIHono<HonoEnv>();

permissionRoutes
    .openapi(getAccessControlPermissionsRoute, getAccessControlPermissionsRouteHandler)
    .openapi(createAccessControlPermissionRoute, createAccessControlPermissionRouteHandler)
    .openapi(updateAccessControlPermissionRoute, updateAccessControlPermissionRouteHandler)
    .openapi(deleteAccessControlPermissionRoute, deleteAccessControlPermissionRouteHandler);

export default permissionRoutes;
