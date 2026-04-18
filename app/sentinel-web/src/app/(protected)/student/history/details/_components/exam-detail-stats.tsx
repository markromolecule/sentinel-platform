import { cn } from '@sentinel/ui';
import { ExamDetailStatsProps } from '@sentinel/shared/types';

export function ExamDetailStats({ score, totalScore, percentage }: ExamDetailStatsProps) {
    const hasScore = typeof score === 'number' && typeof totalScore === 'number';
    const correctAnswers =
        hasScore && totalScore > 0 ? Math.round((score / totalScore) * totalScore) : null;
    const mistakes = hasScore ? Math.max(totalScore - score, 0) : null;

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Score
                </span>
                <div className="text-foreground text-2xl font-bold">
                    {typeof score === 'number' ? score : '--'}{' '}
                    <span className="text-muted-foreground text-sm font-normal">
                        / {typeof totalScore === 'number' ? totalScore : '--'}
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
                        typeof percentage === 'number'
                            ? percentage >= 75
                                ? 'text-green-500'
                                : 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    {typeof percentage === 'number' ? `${percentage}%` : '--'}
                </div>
            </div>
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Correct
                </span>
                <div className="text-foreground text-2xl font-bold">{correctAnswers ?? '--'}</div>
            </div>
            <div className="bg-card border-border/50 space-y-1 rounded-xl border p-4">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Mistakes
                </span>
                <div className="text-foreground text-2xl font-bold">{mistakes ?? '--'}</div>
            </div>
        </div>
    );
}
