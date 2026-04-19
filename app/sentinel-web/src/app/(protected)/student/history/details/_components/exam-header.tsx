import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { HistoryExamHeaderProps as ExamHeaderProps } from '@sentinel/shared/types';

export function ExamHeader({ subject, status }: ExamHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground h-auto justify-start px-0 hover:bg-transparent"
            >
                <Link href="/student/history" className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back to History
                </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-muted-foreground rounded-none px-2.5 py-1">
                    {subject}
                </Badge>
                <Badge
                    className={cn(
                        'rounded-none px-2.5 py-1 capitalize',
                        status === 'turned_in'
                            ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-500'
                            : status === 'past_due'
                              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                              : 'bg-primary/10 text-primary hover:bg-primary/20',
                    )}
                >
                    {status.replace('_', ' ')}
                </Badge>
            </div>
        </div>
    );
}
