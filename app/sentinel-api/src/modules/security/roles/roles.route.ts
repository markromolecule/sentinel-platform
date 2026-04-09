import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import {
    createAccessControlRoleRoute,
    createAccessControlRoleRouteHandler,
} from './controllers/create-access-control-role.controller';
import {
    deleteAccessControlRoleRoute,
    deleteAccessControlRoleRouteHandler,
} from './controllers/delete-access-control-role.controller';
import {
    getAccessControlRolesRoute,
    getAccessControlRolesRouteHandler,
} from './controllers/get-access-control-roles.controller';
import {
    replaceAccessControlRolePermissionsRoute,
    replaceAccessControlRolePermissionsRouteHandler,
} from './controllers/replace-access-control-role-permissions.controller';
import {
    updateAccessControlRoleRoute,
    updateAccessControlRoleRouteHandler,
} from './controllers/update-access-control-role.controller';

const rolesRoutes = new OpenAPIHono<HonoEnv>();

rolesRoutes
    .openapi(getAccessControlRolesRoute, getAccessControlRolesRouteHandler)
    .openapi(createAccessControlRoleRoute, createAccessControlRoleRouteHandler)
    .openapi(updateAccessControlRoleRoute, updateAccessControlRoleRouteHandler)
    .openapi(deleteAccessControlRoleRoute, deleteAccessControlRoleRouteHandler)
    .openapi(
        replaceAccessControlRolePermissionsRoute,
        replaceAccessControlRolePermissionsRouteHandler,
    );

export default rolesRoutes;
