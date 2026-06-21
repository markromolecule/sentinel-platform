import { HTTPException } from 'hono/http-exception';
import { PERMISSIONS } from '@sentinel/shared/constants';
import { LogsService } from '../../../general/logs/logs.service';

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

export async function logAudioUploadAuthorization(
    dbClient: any,
    args: {
        attemptId: string;
        studentId: string;
        institutionId: string;
        fileSize: number;
        audioDuration: number;
    },
) {
    try {
        await LogsService.createLog(dbClient, {
            userId: args.studentId,
            action: 'infrastructure.audio_authorized',
            resourceType: 'audio',
            resourceId: args.attemptId,
            activeInstitutionId: args.institutionId,
            details: {
                attemptId: args.attemptId,
                fileSize: args.fileSize,
                audioDuration: args.audioDuration,
            },
        });
    } catch (logErr) {
        console.error('Failed to log audio authorization:', logErr);
    }
}
