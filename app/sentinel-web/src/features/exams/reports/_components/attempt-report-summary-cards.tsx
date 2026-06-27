import type { AttemptGradingDetailType } from '@sentinel/shared';
import { Badge, Card } from '@sentinel/ui';
import { Trophy, Lock, Unlock, MessageSquare } from 'lucide-react';

type AttemptReportSummaryCardsProps = {
    attempt: AttemptGradingDetailType;
};

/**
 * Renders a row of modular, compact summary cards for an exam attempt report.
 * Includes the final score, finalization status, and overall feedback.
 */
export function AttemptReportSummaryCards({ attempt }: AttemptReportSummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ScoreCard attempt={attempt} />
            <StatusCard attempt={attempt} />
            <FeedbackCard attempt={attempt} />
        </div>
    );
}

/**
 * Displays the student's final score metric with a trophy accent.
 */
function ScoreCard({ attempt }: { attempt: AttemptGradingDetailType }) {
    return (
        <Card className="flex flex-row items-center gap-3.5 p-4 py-3 border-border/50 bg-card shadow-none">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Trophy className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Final Score
                </span>
                <span className="text-lg font-bold text-foreground">
                    {attempt.score ?? 'N/A'}{' '}
                    <span className="text-muted-foreground font-normal text-xs">
                        / {attempt.totalScore ?? 'N/A'}
                    </span>
                </span>
            </div>
        </Card>
    );
}

/**
 * Displays the current finalization status and release state.
 */
function StatusCard({ attempt }: { attempt: AttemptGradingDetailType }) {
    const isFinalized = !!attempt.grading.finalizedAt;

    return (
        <Card className="flex flex-row items-center gap-3.5 p-4 py-3 border-border/50 bg-card shadow-none">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isFinalized
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
            >
                {isFinalized ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            </div>
            <div className="flex flex-col min-w-0 w-full gap-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Finalization
                </span>
                <div className="flex items-center gap-2 min-w-0">
                    <Badge
                        variant={isFinalized ? 'default' : 'secondary'}
                        className="h-5 px-1.5 text-[9px] uppercase font-bold tracking-wider shrink-0"
                    >
                        {isFinalized ? 'Finalized' : 'Draft'}
                    </Badge>
                    <span
                        className="text-xs text-muted-foreground truncate"
                        title={
                            isFinalized
                                ? `Locked at ${new Date(attempt.grading.finalizedAt!).toLocaleString()}`
                                : 'Visible to students after finalization'
                        }
                    >
                        {isFinalized
                            ? `Locked ${new Date(attempt.grading.finalizedAt!).toLocaleDateString()}`
                            : 'Visible after release'}
                    </span>
                </div>
            </div>
        </Card>
    );
}

/**
 * Displays any overall feedback recorded for the attempt.
 */
function FeedbackCard({ attempt }: { attempt: AttemptGradingDetailType }) {
    return (
        <Card className="flex flex-row items-center gap-3.5 p-4 py-3 border-border/50 bg-card shadow-none">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Overall Feedback
                </span>
                <p
                    className="text-xs font-medium text-foreground truncate"
                    title={attempt.feedback || 'No overall feedback recorded.'}
                >
                    {attempt.feedback || 'No overall feedback recorded.'}
                </p>
            </div>
        </Card>
    );
}
