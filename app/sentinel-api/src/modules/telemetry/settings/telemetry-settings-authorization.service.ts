import { HTTPException } from 'hono/http-exception';
import { PERMISSIONS } from '@sentinel/shared/constants';

export const TELEMETRY_SETTINGS_PERMISSION_KEYS = {
    viewSettings: PERMISSIONS.VIEW_TELEMETRY_SETTINGS.id,
    updateSettings: PERMISSIONS.UPDATE_TELEMETRY_SETTINGS.id,
    viewHealth: PERMISSIONS.VIEW_TELEMETRY_HEALTH.id,
} as const;

export function assertTelemetrySettingsPermission(args: {
    role?: string | null;
    activePermissionKeys?: string[] | null;
    requiredPermission: (typeof TELEMETRY_SETTINGS_PERMISSION_KEYS)[keyof typeof TELEMETRY_SETTINGS_PERMISSION_KEYS];
}) {
    const { role, activePermissionKeys, requiredPermission } = args;

    if (activePermissionKeys?.includes(requiredPermission)) {
        return;
    }

    // Keep support-role access as a rollout fallback while explicit permissions propagate.
    if (role === 'support') {
        return;
    }

    throw new HTTPException(403, {
        message: `Forbidden. Missing required permission: ${requiredPermission}.`,
    });
}
