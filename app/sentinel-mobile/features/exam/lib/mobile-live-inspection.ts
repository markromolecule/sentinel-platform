import type { LiveInspectionDirective, LiveInspectionState } from '@sentinel/shared/schema';

/**
 * Checks if the given directive state indicates that the mobile client
 * should be publishing a live inspection video stream.
 */
export function isLiveInspectionPublishState(state?: string | null): boolean {
    return (
        state === 'REQUESTED' ||
        state === 'PUBLISHER_CONNECTING' ||
        state === 'PUBLISHER_READY' ||
        state === 'LIVE'
    );
}

/**
 * Checks if the given directive state indicates that the live inspection
 * is ending, stopped, failed, or expired.
 */
export function isLiveInspectionStopState(state?: string | null): boolean {
    return (
        state === 'STOPPING' ||
        state === 'ENDED' ||
        state === 'FAILED' ||
        state === 'EXPIRED'
    );
}

/**
 * Determines whether an error from directive reconciliation indicates that
 * live inspection is simply not active or unavailable for the session (404 Not Found).
 */
export function isLiveInspectionNotFoundError(err: unknown): boolean {
    if (!err || typeof err !== 'object') {
        return false;
    }

    const errorObj = err as Record<string, any>;
    const status = errorObj.status ?? errorObj.statusCode;
    const message = typeof errorObj.message === 'string' ? errorObj.message : '';

    return (
        status === 404 ||
        message.includes('Live inspection is not available') ||
        message.includes('not found')
    );
}
