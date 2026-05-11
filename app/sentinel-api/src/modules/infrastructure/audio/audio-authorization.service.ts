import { HTTPException } from 'hono/http-exception';
import { PERMISSIONS } from '@sentinel/shared/constants';

export const AUDIO_PERMISSION_KEYS = {
    readCalibration: PERMISSIONS.READ_AUDIO_CALIBRATION.id,
    manageCalibration: PERMISSIONS.MANAGE_AUDIO_CALIBRATION.id,
    readIncidents: PERMISSIONS.READ_AUDIO_INCIDENTS.id,
} as const;

export function assertAudioPermission(args: {
    role?: string | null;
    activePermissionKeys?: string[] | null;
    requiredPermission: (typeof AUDIO_PERMISSION_KEYS)[keyof typeof AUDIO_PERMISSION_KEYS];
}) {
    const { role, activePermissionKeys, requiredPermission } = args;

    if (activePermissionKeys?.includes(requiredPermission)) {
        return;
    }

    if (
        (requiredPermission === AUDIO_PERMISSION_KEYS.readCalibration ||
            requiredPermission === AUDIO_PERMISSION_KEYS.manageCalibration) &&
        (role === 'support' || role === 'admin')
    ) {
        return;
    }

    if (
        requiredPermission === AUDIO_PERMISSION_KEYS.readIncidents &&
        (role === 'admin' || role === 'instructor')
    ) {
        return;
    }

    throw new HTTPException(403, {
        message: `Forbidden. Missing required permission: ${requiredPermission}.`,
    });
}
