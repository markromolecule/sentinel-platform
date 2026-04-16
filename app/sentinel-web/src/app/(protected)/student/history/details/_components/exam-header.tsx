import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { HistoryExamHeaderProps as ExamHeaderProps } from '@sentinel/shared/types';

export function ExamHeader({ subject, status }: ExamHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
            >
                <Link href="/student/history" className="flex items-center gap-2">
                    <ChevronLeft className="h-5 w-5" />
                    Back to History
                </Link>
            </Button>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-border text-muted-foreground">
                    {subject}
                </Badge>
                <Badge
                    className={cn(
                        'capitalize',
                        status === 'passed'
                            ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-500'
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/20',
                    )}
                >
                    {status}
                </Badge>
            </div>
        </div>
    );
}
