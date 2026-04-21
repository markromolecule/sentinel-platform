import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import { ensureAccessControlCatalogs } from '../../security/access-control/services/access-control-catalog.service';
import { getUserActivePermissions } from '../../security/permission/data/get-user-active-permissions';
import {
    getTelemetrySettingsRoute,
    getTelemetrySettingsRouteHandler,
} from './controllers/get-telemetry-settings.controller';
import {
    updateTelemetrySettingsRoute,
    updateTelemetrySettingsRouteHandler,
} from './controllers/update-telemetry-settings.controller';

const telemetrySettingsRoutes = new OpenAPIHono<HonoEnv>();

telemetrySettingsRoutes.use('*', authMiddleware);
telemetrySettingsRoutes.use('*', async (c, next) => {
    await ensureAccessControlCatalogs(c.get('dbClient'));
    const user = c.get('user');
    const activePermissionKeys = await getUserActivePermissions(c.get('dbClient'), user.id);
    c.set('activePermissionKeys', activePermissionKeys);
    await next();
});

telemetrySettingsRoutes
    .openapi(getTelemetrySettingsRoute, getTelemetrySettingsRouteHandler)
    .openapi(updateTelemetrySettingsRoute, updateTelemetrySettingsRouteHandler);

export default telemetrySettingsRoutes;
