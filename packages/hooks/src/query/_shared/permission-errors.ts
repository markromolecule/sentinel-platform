import { ApiError } from '@sentinel/services';
import { toast } from 'sonner';

export interface PermissionMessageOptions {
    resourceName: string;
    action: string;
    actionLabel?: string;
}

export interface PermissionToastOptions extends PermissionMessageOptions {
    fallbackMessage?: string;
    permissionKey?: string;
}

export function getErrorMessage(error: unknown, fallbackMessage = 'Something went wrong.') {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }

    return fallbackMessage;
}

export function isPermissionDeniedError(error: unknown, permissionKey?: string) {
    if (error instanceof ApiError && error.status === 403) {
        return true;
    }

    if (!(error instanceof Error)) {
        return false;
    }

    const message = error.message.toLowerCase();

    if (permissionKey && message.includes(permissionKey.toLowerCase())) {
        return true;
    }

    return (
        message.includes('forbidden') ||
        message.includes('permission denied') ||
        message.includes('not authorized') ||
        (message.includes('missing') && message.includes('permission'))
    );
}

export function findPermissionDeniedError(errors: Array<unknown>) {
    return errors.find((error) => isPermissionDeniedError(error)) ?? null;
}

export function getPermissionDeniedMessage({
    resourceName,
    action,
    actionLabel,
}: PermissionMessageOptions) {
    const normalizedActionLabel = actionLabel ?? `${action} ${resourceName}`;
    return `You no longer have permission to ${normalizedActionLabel}. Contact support if you need access restored.`;
}

export function notifyPermissionDenied(error: unknown, options: PermissionToastOptions) {
    if (isPermissionDeniedError(error, options.permissionKey)) {
        toast.error(getPermissionDeniedMessage(options));
        return;
    }

    toast.error(getErrorMessage(error, options.fallbackMessage));
}
