import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { AudioService } from '../audio.service';
import { assertAudioPermission, AUDIO_PERMISSION_KEYS } from '../audio-authorization.service';
import { getAudioSettingsSchema } from '../audio.dto';

export const getAudioSettingsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Audio'],
    summary: 'Get global audio anomaly calibration settings',
    responses: {
        200: {
            description: 'Audio anomaly settings fetched successfully.',
            content: {
                'application/json': {
                    schema: getAudioSettingsSchema.response,
                },
            },
        },
    },
});

export const getAudioSettingsRouteHandler: AppRouteHandler<typeof getAudioSettingsRoute> = async (
    c,
) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertAudioPermission({
        role: supabaseUser?.user_metadata?.role,
        activePermissionKeys: c.get('activePermissionKeys'),
        requiredPermission: AUDIO_PERMISSION_KEYS.readCalibration,
    });

    const data = await AudioService.getAnomalyConfig(c.get('dbClient'));

    return c.json({
        message: 'Audio anomaly settings fetched successfully.',
        data,
    });
};
