import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import type { LobbyStateLabel } from '../_types';

export function formatLobbyCountdown(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => value.toString().padStart(2, '0'))
        .join(':');
}

export function getLobbyStateLabel(
    runtimeAccess?: ExamRuntimeAccess | null,
    hasCompletedFlow?: boolean
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
