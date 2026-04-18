import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import { ExamHeroScoreProps } from '@sentinel/shared/types';

export function ExamHeroScore({ percentage, result }: ExamHeroScoreProps) {
    const hasScore = typeof percentage === 'number';

    return (
        <div className="space-y-6">
            <div className="from-primary/20 to-card border-border/50 relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-b p-8 text-center">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 space-y-4">
                    <div className="text-muted-foreground font-medium">Final Result</div>

                    <div
                        className={cn(
                            'text-7xl font-bold tracking-tighter',
                            result === 'passed'
                                ? 'text-green-500'
                                : result === 'failed'
                                  ? 'text-destructive'
                                  : 'text-muted-foreground',
                        )}
                    >
                        {hasScore ? `${percentage}%` : '--'}
                    </div>

                    {result ? (
                        <Badge
                            className={cn(
                                'px-4 py-1.5 text-base',
                                result === 'passed'
                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20',
                            )}
                        >
                            {result === 'passed' ? (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                            )}
                            {result === 'passed' ? 'Passed' : 'Failed'}
                        </Badge>
                    ) : (
                        <Badge className="bg-muted text-muted-foreground px-4 py-1.5 text-base">
                            Awaiting result
                        </Badge>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="bg-card border-border/50 space-y-2 rounded-xl border p-6 text-center">
                <h3 className="text-foreground font-medium">Need Help?</h3>
                <p className="text-muted-foreground text-sm">
                    If you believe there is an error in this record, please contact your professor.
                </p>
                <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent hover:text-accent-foreground mt-2 w-full bg-transparent transition-colors"
                >
                    Contact Support
                </Button>
            </div>
        </div>
    );
}
