import { PreviewPageHeader } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-page-header';
import { PreviewHighlightsList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/cards/preview-highlights-list';
import { LOBBY_READINESS_CONFIG } from '../_constants';
import { getLobbyStateLabel } from '../_utils';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';

export type LobbyHeaderProps = {
    duration: number;
    presenceCount: number | string;
    maxReconnectAttempts: number;
    runtimeAccess?: ExamRuntimeAccess | null;
    hasCompletedFlow: boolean;
};

export function LobbyHeader({
    duration,
    presenceCount,
    maxReconnectAttempts,
    runtimeAccess,
    hasCompletedFlow,
}: LobbyHeaderProps) {
    const highlights = [
        {
            label: 'Duration',
            value: `${duration} minutes`,
            icon: LOBBY_READINESS_CONFIG.icons.DurationLobby,
        },
        {
            label: 'Lobby Count',
            value: typeof presenceCount === 'number' ? `${presenceCount} students` : presenceCount,
            icon: LOBBY_READINESS_CONFIG.icons.LobbyCount,
        },
        {
            label: 'Reconnect',
            value:
                runtimeAccess?.reconnectAttemptsRemaining !== undefined
                    ? `${runtimeAccess.reconnectAttemptsRemaining} of ${runtimeAccess.totalReconnectAttempts} left`
                    : `${maxReconnectAttempts} attempts`,
            icon: LOBBY_READINESS_CONFIG.icons.Reconnect,
        },
        {
            label: 'Exam State',
            value: getLobbyStateLabel(runtimeAccess, hasCompletedFlow),
            icon: LOBBY_READINESS_CONFIG.icons.ExamState,
        },
    ];

    return (
        <section className="space-y-4 border-b pb-6 sm:space-y-5 sm:pb-8">
            <PreviewPageHeader
                title="Lobby"
                description="This is the final waiting area before the live attempt begins."
            />
            <PreviewHighlightsList highlights={highlights} />
        </section>
    );
}
