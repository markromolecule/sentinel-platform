import { cn } from '@sentinel/ui';
import { ExamDetailStatsProps } from '@sentinel/shared/types';

export function ExamDetailStats({ score, totalScore, percentage }: ExamDetailStatsProps) {
    const hasScore = typeof score === 'number' && typeof totalScore === 'number';
    const correctAnswers =
        hasScore && totalScore > 0 ? Math.round((score / totalScore) * totalScore) : null;
    const mistakes = hasScore ? Math.max(totalScore - score, 0) : null;
    const statCards = [
        {
            label: 'Score',
            value: typeof score === 'number' ? score : '--',
            trailing: typeof totalScore === 'number' ? `/ ${totalScore}` : '/ --',
            valueClassName: 'text-foreground',
        },
        {
            label: 'Grade',
            value: typeof percentage === 'number' ? `${percentage}%` : '--',
            valueClassName:
                typeof percentage === 'number'
                    ? percentage >= 75
                        ? 'text-green-700 dark:text-green-500'
                        : 'text-destructive'
                    : 'text-muted-foreground',
        },
        {
            label: 'Correct',
            value: correctAnswers ?? '--',
            valueClassName: 'text-foreground',
        },
        {
            label: 'Mistakes',
            value: mistakes ?? '--',
            valueClassName: 'text-foreground',
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
                <div key={card.label} className="border-border/60 space-y-2 border p-4">
                    <span className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
                        {card.label}
                    </span>
                    <div className={cn('text-2xl font-semibold tracking-tight', card.valueClassName)}>
                        {card.value}
                        {card.label === 'Score' ? (
                            <span className="text-muted-foreground ml-1 text-sm font-normal">
                                {card.trailing}
                            </span>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
