import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import type { LobbyStateLabel } from '../_types';

export type LobbyReconnectDisplay = {
    headerValue: string;
    statusMessage: string | null;
};

export function formatLobbyCountdown(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

/**
 * Resolves reconnect copy for lobby summary and status surfaces without
 * presenting placeholder 0/0 runtime values as a confirmed nonzero policy.
 */
export function resolveReconnectDisplay(
    runtimeAccess?: ExamRuntimeAccess | null,
    configuredMaxReconnectAttempts?: number | null,
): LobbyReconnectDisplay {
    const remaining = runtimeAccess?.reconnectAttemptsRemaining;
    const total = runtimeAccess?.totalReconnectAttempts;
    const configuredTotal = configuredMaxReconnectAttempts ?? null;

    if (typeof remaining === 'number' && typeof total === 'number') {
        const isPlaceholderZeroPolicy = total === 0 && remaining === 0 && configuredTotal !== 0;

        if (isPlaceholderZeroPolicy) {
            const fallbackTotal = Math.max(0, configuredTotal ?? 0);

            return {
                headerValue: `0 used • ${fallbackTotal} left`,
                statusMessage: `Reconnect attempts used: 0 of ${fallbackTotal}. Remaining: ${fallbackTotal}.`,
            };
        }

        const used = Math.max(0, total - remaining);

        return {
            headerValue: `${used} used • ${remaining} left`,
            statusMessage: `Reconnect attempts used: ${used} of ${total}. Remaining: ${remaining}.`,
        };
    }

    if (typeof configuredTotal === 'number') {
        return {
            headerValue: `${configuredTotal} total attempts`,
            statusMessage: null,
        };
    }

    return {
        headerValue: 'Policy unavailable',
        statusMessage: runtimeAccess
            ? 'Total reconnect attempts allowed: unavailable for this session.'
            : null,
    };
}

export function getLobbyStateLabel(
    runtimeAccess?: ExamRuntimeAccess | null,
    hasCompletedFlow?: boolean,
): LobbyStateLabel {
    if (runtimeAccess?.canResume) {
        return 'Resume active attempt';
    }

    switch (runtimeAccess?.state) {
        case 'lobby_waiting':
            return runtimeAccess.reasonCode === 'LOBBY_REJECTED'
                ? 'Awaiting re-approval'
                : 'Waiting for approval';
        case 'lobby_approved':
            return 'Approved to continue';
        case 'before_start':
            return 'Read-only until start';
        case 'locked':
            return 'Locked by instructor';
        case 'reopened':
            return 'Reopened access';
        case 'closed':
            return 'Closed';
        case 'open':
        default:
            return hasCompletedFlow ? 'Ready for entry' : 'Pending checks';
    }
}
