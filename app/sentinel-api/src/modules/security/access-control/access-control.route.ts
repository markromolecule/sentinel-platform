import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import permissionRoutes from '../permission/permission.route';
import rolesRoutes from '../roles/roles.route';
import {
    createAccessControlAssignmentRoute,
    createAccessControlAssignmentRouteHandler,
} from './controllers/create-access-control-assignment.controller';
import {
    deleteAccessControlAssignmentRoute,
    deleteAccessControlAssignmentRouteHandler,
} from './controllers/delete-access-control-assignment.controller';
import {
    getAccessControlAssignmentsRoute,
    getAccessControlAssignmentsRouteHandler,
} from './controllers/get-access-control-assignments.controller';
import {
    getAccessControlExaminationSettingsRoute,
    getAccessControlExaminationSettingsRouteHandler,
} from './controllers/get-access-control-examination-settings.controller';
import {
    getAccessControlOverviewRoute,
    getAccessControlOverviewRouteHandler,
} from './controllers/get-access-control-overview.controller';
import {
    updateAccessControlExaminationSettingsRoute,
    updateAccessControlExaminationSettingsRouteHandler,
} from './controllers/update-access-control-examination-settings.controller';
import { ensureAccessControlSchemaReady } from './services/access-control-schema.service';

const accessControlRoutes = new OpenAPIHono<HonoEnv>();

accessControlRoutes.use('*', authMiddleware);
accessControlRoutes.use('*', async (c, next) => {
    await ensureAccessControlSchemaReady(c.get('dbClient'));
    await next();
});
accessControlRoutes.route('/', rolesRoutes);
accessControlRoutes.route('/', permissionRoutes);

accessControlRoutes
    .openapi(getAccessControlOverviewRoute, getAccessControlOverviewRouteHandler)
    .openapi(getAccessControlAssignmentsRoute, getAccessControlAssignmentsRouteHandler)
    .openapi(createAccessControlAssignmentRoute, createAccessControlAssignmentRouteHandler)
    .openapi(deleteAccessControlAssignmentRoute, deleteAccessControlAssignmentRouteHandler)
    .openapi(
        getAccessControlExaminationSettingsRoute,
        getAccessControlExaminationSettingsRouteHandler,
    )
    .openapi(
        updateAccessControlExaminationSettingsRoute,
        updateAccessControlExaminationSettingsRouteHandler,
    );

export default accessControlRoutes;
