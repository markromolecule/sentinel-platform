import { resolveReconnectDisplay } from '../_utils';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';

export type LobbyStatusInfoProps = {
    readyCount: number;
    totalChecks: number;
    maxReconnectAttempts: number;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export function LobbyStatusInfo({
    readyCount,
    totalChecks,
    maxReconnectAttempts,
    runtimeAccess,
}: LobbyStatusInfoProps) {
    const reconnectDisplay = resolveReconnectDisplay(runtimeAccess, maxReconnectAttempts);

    return (
        <div className="border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
            <h2 className="text-base font-semibold sm:text-lg">Lobby status</h2>
            <div className="text-muted-foreground space-y-4 text-sm leading-6 sm:text-[15px]">
                <p>
                    Students who completed orientation, consent, and device checkup are directed
                    here before entering the live exam.
                </p>
                <p>
                    The lobby confirms that the environment is ready and that the exam can continue
                    into the actual attempt screen.
                </p>
                <p>
                    Current readiness: {readyCount}/{totalChecks} completed.
                </p>
                {reconnectDisplay.statusMessage ? <p>{reconnectDisplay.statusMessage}</p> : null}
                {runtimeAccess?.state === 'lobby_waiting' ? (
                    <p>Instructor approval is still required before the attempt can start.</p>
                ) : null}
                {runtimeAccess?.state === 'lobby_approved' ? (
                    <p>Your instructor has approved this entry. Continue when you are ready.</p>
                ) : null}
            </div>
        </div>
    );
}
