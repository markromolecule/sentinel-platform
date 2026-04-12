import {
    getPermissionDeniedMessage,
    isPermissionDeniedError,
    notifyPermissionDenied,
} from '../_shared/permission-errors';

export function isCoursePermissionError(error: Error, permissionKey?: string) {
    return isPermissionDeniedError(error, permissionKey);
}

export function getCoursePermissionMessage(action: 'view' | 'create' | 'update' | 'delete') {
    return getPermissionDeniedMessage({
        resourceName: 'courses',
        action,
    });
}

export function notifyCoursePermissionError(error: Error, action: 'view' | 'create' | 'update' | 'delete') {
    notifyPermissionDenied(error, {
        resourceName: 'courses',
        action,
        permissionKey: `courses:${action}`,
    });
}
