import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateTelemetrySettingsSchema } from '../settings.dto';
import { TelemetrySettingsService } from '../telemetry-settings.service';
import {
    assertTelemetrySettingsPermission,
    TELEMETRY_SETTINGS_PERMISSION_KEYS,
} from '../telemetry-settings-authorization.service';

export const updateTelemetrySettingsRoute = createRoute({
    method: 'put',
    path: '/settings',
    tags: ['Telemetry'],
    summary: 'Update support-managed telemetry settings',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: updateTelemetrySettingsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Telemetry settings updated successfully.',
            content: {
                'application/json': {
                    schema: updateTelemetrySettingsSchema.response,
                },
            },
        },
    },
});

export const updateTelemetrySettingsRouteHandler: AppRouteHandler<
    typeof updateTelemetrySettingsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertTelemetrySettingsPermission({
        role: supabaseUser?.user_metadata?.role,
        activePermissionKeys: c.get('activePermissionKeys'),
        requiredPermission: TELEMETRY_SETTINGS_PERMISSION_KEYS.updateSettings,
    });

    const body = c.req.valid('json');
    const user = c.get('user');
    const data = await TelemetrySettingsService.updateTelemetrySettings(
        c.get('dbClient'),
        body,
        user?.id,
    );

    return c.json({ message: 'Telemetry settings updated successfully.', data });
};
