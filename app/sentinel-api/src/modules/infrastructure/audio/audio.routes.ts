import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import { ensureAccessControlCatalogs } from '../../security/access-control/services/access-control-catalog.service';
import { getUserActivePermissions } from '../../security/permission/data/get-user-active-permissions';
import {
    getAudioSettingsRoute,
    getAudioSettingsRouteHandler,
} from './controllers/get-audio-settings.controller';
import {
    updateAudioSettingsRoute,
    updateAudioSettingsRouteHandler,
} from './controllers/update-audio-settings.controller';

const audioRoutes = new OpenAPIHono<HonoEnv>();

audioRoutes.use('*', authMiddleware);
audioRoutes.use('*', async (c, next) => {
    await ensureAccessControlCatalogs(c.get('dbClient'));
    const user = c.get('user');
    const activePermissionKeys = await getUserActivePermissions(c.get('dbClient'), user.id);
    c.set('activePermissionKeys', activePermissionKeys);
    await next();
});

audioRoutes
    .openapi(getAudioSettingsRoute, getAudioSettingsRouteHandler)
    .openapi(updateAudioSettingsRoute, updateAudioSettingsRouteHandler);

export default audioRoutes;
