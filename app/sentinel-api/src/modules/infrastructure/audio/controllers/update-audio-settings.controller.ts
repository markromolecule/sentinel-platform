import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { AudioService } from '../audio.service';
import {
    assertAudioPermission,
    AUDIO_PERMISSION_KEYS,
} from '../services/audio-authorization.service';
import { updateAudioSettingsSchema } from '../audio.dto';

export const updateAudioSettingsRoute = createRoute({
    method: 'put',
    path: '/',
    tags: ['Audio'],
    summary: 'Update global audio anomaly calibration settings',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: updateAudioSettingsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Audio anomaly settings updated successfully.',
            content: {
                'application/json': {
                    schema: updateAudioSettingsSchema.response,
                },
            },
        },
    },
});

export const updateAudioSettingsRouteHandler: AppRouteHandler<
    typeof updateAudioSettingsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertAudioPermission({
        role: supabaseUser?.user_metadata?.role,
        activePermissionKeys: c.get('activePermissionKeys'),
        requiredPermission: AUDIO_PERMISSION_KEYS.manageCalibration,
    });

    const body = c.req.valid('json');
    const user = c.get('user');
    const data = await AudioService.updateAnomalyConfig(c.get('dbClient'), body, user?.id);

    return c.json({
        message: 'Audio anomaly settings updated successfully.',
        data,
    });
};
