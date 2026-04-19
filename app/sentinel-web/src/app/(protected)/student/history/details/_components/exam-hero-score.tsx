import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import { ExamHeroScoreProps } from '@sentinel/shared/types';

export function ExamHeroScore({ percentage, result }: ExamHeroScoreProps) {
    const hasScore = typeof percentage === 'number';

    return (
        <div className="space-y-4">
            <div className="border-border/60 border p-5">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
                            Final Result
                        </p>
                        <div
                            className={cn(
                                'text-5xl font-semibold tracking-tight sm:text-6xl',
                                result === 'passed'
                                    ? 'text-green-700 dark:text-green-500'
                                    : result === 'failed'
                                      ? 'text-destructive'
                                      : 'text-muted-foreground',
                            )}
                        >
                            {hasScore ? `${percentage}%` : '--'}
                        </div>
                    </div>

                    {result ? (
                        <Badge
                            className={cn(
                                'rounded-none px-2.5 py-1',
                                result === 'passed'
                                    ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-500'
                                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20',
                            )}
                        >
                            {result === 'passed' ? (
                                <CheckCircle className="mr-1 h-4 w-4" />
                            ) : (
                                <XCircle className="mr-1 h-4 w-4" />
                            )}
                            {result === 'passed' ? 'Passed' : 'Failed'}
                        </Badge>
                    ) : (
                        <Badge className="bg-muted text-muted-foreground rounded-none px-2.5 py-1">
                            Awaiting result
                        </Badge>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="bg-muted/50 border border-border/60 px-3 py-3">
                            <p className="text-muted-foreground text-xs uppercase">Status</p>
                            <p className="text-foreground mt-1 text-sm font-medium">
                                {result === 'passed'
                                    ? 'You met the passing threshold.'
                                    : result === 'failed'
                                      ? 'You did not reach the passing threshold.'
                                      : 'Your score is still being finalized.'}
                            </p>
                        </div>
                        <div className="bg-muted/50 border border-border/60 px-3 py-3">
                            <p className="text-muted-foreground text-xs uppercase">Record</p>
                            <p className="text-foreground mt-1 text-sm font-medium">
                                Review your attempt details before contacting support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-border/60 space-y-2 border p-5">
                <h3 className="text-foreground text-base font-semibold">Need Help?</h3>
                <p className="text-muted-foreground text-sm">
                    If you believe there is an error in this record, please contact your professor.
                </p>
                <Button
                    variant="outline"
                    className="mt-2 w-full bg-transparent"
                >
                    Contact Support
                </Button>
            </div>
        </div>
    );
}
