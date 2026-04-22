import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getTelemetrySettingsSchema } from '../settings.dto';
import { TelemetrySettingsService } from '../telemetry-settings.service';
import {
    assertTelemetrySettingsPermission,
    TELEMETRY_SETTINGS_PERMISSION_KEYS,
} from '../telemetry-settings-authorization.service';

export const getTelemetrySettingsRoute = createRoute({
    method: 'get',
    path: '/settings',
    tags: ['Telemetry'],
    summary: 'Get support-managed telemetry settings',
    responses: {
        200: {
            description: 'Telemetry settings fetched successfully.',
            content: {
                'application/json': {
                    schema: getTelemetrySettingsSchema.response,
                },
            },
        },
    },
});

export const getTelemetrySettingsRouteHandler: AppRouteHandler<
    typeof getTelemetrySettingsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertTelemetrySettingsPermission({
        role: supabaseUser?.user_metadata?.role,
        activePermissionKeys: c.get('activePermissionKeys'),
        requiredPermission: TELEMETRY_SETTINGS_PERMISSION_KEYS.viewSettings,
    });

    const data = await TelemetrySettingsService.getTelemetrySettings(c.get('dbClient'));

    return c.json({ message: 'Telemetry settings fetched successfully.', data });
};
