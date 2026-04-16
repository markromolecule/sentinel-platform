import { cn } from '@sentinel/ui';
import { ExamDetailStatsProps } from '@sentinel/shared/types';

export function ExamDetailStats({ score, totalScore, percentage }: ExamDetailStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Score
                </span>
                <div className="text-foreground text-2xl font-bold">
                    {score}{' '}
                    <span className="text-muted-foreground text-sm font-normal">
                        / {totalScore}
                    </span>
                </div>
            </div>
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Grade
                </span>
                <div
                    className={cn(
                        'text-2xl font-bold',
                        percentage >= 75 ? 'text-green-500' : 'text-destructive',
                    )}
                >
                    {percentage}%
                </div>
            </div>
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Correct
                </span>
                <div className="text-foreground text-2xl font-bold">
                    {Math.round((score / totalScore) * 100) / 2}
                </div>
            </div>
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Mistakes
                </span>
                <div className="text-foreground text-2xl font-bold">{totalScore - score}</div>
            </div>
        </div>
    );
}
