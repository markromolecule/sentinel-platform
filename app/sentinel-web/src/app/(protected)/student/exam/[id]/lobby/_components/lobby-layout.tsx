import { LobbyStatusInfo } from './lobby-status-info';
import { LobbyEntryRequirements } from './lobby-entry-requirements';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';

export type LobbyLayoutProps = {
    hasCompletedFlow: boolean;
    accessMessage?: string | null;
    countdownLabel?: string | null;
    mediaPipeLobbyMessage?: string | null;
    runtimeAccess?: ExamRuntimeAccess | null;
    reopenedUntil?: Date | null;
};

export function LobbyLayout({
    hasCompletedFlow,
    accessMessage,
    countdownLabel,
    mediaPipeLobbyMessage,
    runtimeAccess,
    reopenedUntil,
}: LobbyLayoutProps) {
    return (
        <section className="grid items-stretch gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:gap-8 xl:gap-10">
            <LobbyStatusInfo
                readyCount={hasCompletedFlow ? 2 : 0}
                totalChecks={2}
                runtimeAccess={runtimeAccess}
            />

            <LobbyEntryRequirements
                accessMessage={accessMessage}
                countdownLabel={countdownLabel}
                mediaPipeLobbyMessage={mediaPipeLobbyMessage}
                runtimeAccess={runtimeAccess}
                reopenedUntil={reopenedUntil}
            />
        </section>
    );
}
