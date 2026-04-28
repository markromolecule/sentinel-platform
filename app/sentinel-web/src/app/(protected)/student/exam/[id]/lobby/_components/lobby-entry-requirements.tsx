import { ReadinessList } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/lists/readiness-list';
import { LOBBY_READINESS_CONFIG } from '../_constants';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';

export type LobbyEntryRequirementsProps = {
    accessMessage?: string | null;
    countdownLabel?: string | null;
    mediaPipeLobbyMessage?: string | null;
    runtimeAccess?: ExamRuntimeAccess | null;
    reopenedUntil?: Date | null;
};

export function LobbyEntryRequirements({
    accessMessage,
    countdownLabel,
    mediaPipeLobbyMessage,
    runtimeAccess,
    reopenedUntil,
}: LobbyEntryRequirementsProps) {
    return (
        <div className="border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
            <h2 className="text-base font-semibold sm:text-lg">Before entry</h2>
            <ReadinessList items={LOBBY_READINESS_CONFIG.items} />

            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                <p className="text-blue-800/80 dark:text-blue-200/80">
                    <span className="font-semibold">Note:</span> Entering from this step
                    starts or resumes your actual exam session.
                </p>
                {accessMessage ? (
                    <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                        {accessMessage}
                    </p>
                ) : null}
                {countdownLabel ? (
                    <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                        Countdown to access: {countdownLabel}
                    </p>
                ) : null}
                {mediaPipeLobbyMessage ? (
                    <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                        {mediaPipeLobbyMessage}
                    </p>
                ) : null}
                {runtimeAccess?.state === 'reopened' && reopenedUntil ? (
                    <p className="mt-2 text-blue-800/80 dark:text-blue-200/80">
                        Reopened until {reopenedUntil.toLocaleString()}.
                    </p>
                ) : null}
            </div>
        </div>
    );
}
