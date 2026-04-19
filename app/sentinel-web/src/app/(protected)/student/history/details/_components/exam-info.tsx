import { Calendar, Clock } from 'lucide-react';
import { ExamInfoProps } from '@sentinel/shared/types';
import { formatDateTimeLabel } from '@/app/(protected)/student/_lib/student-exam-listing';

export function ExamInfo({ title, primaryDateLabel, primaryDateValue, timeSpent }: ExamInfoProps) {
    return (
        <div className="space-y-4 border-b border-border/60 pb-4">
            <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
                    Exam Details
                </p>
                <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                    {title}
                </h1>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-muted/50 border-border/60 flex items-center gap-3 border px-3 py-3">
                    <div className="bg-background border-border flex h-9 w-9 items-center justify-center border">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-xs uppercase">{primaryDateLabel}</p>
                        <p className="text-foreground truncate text-sm">
                            {formatDateTimeLabel(primaryDateValue)}
                        </p>
                    </div>
                </div>
                <div className="bg-muted/50 border-border/60 flex items-center gap-3 border px-3 py-3">
                    <div className="bg-background border-border flex h-9 w-9 items-center justify-center border">
                        <Clock className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-xs uppercase">Time Spent</p>
                        <p className="text-foreground truncate text-sm">
                            {typeof timeSpent === 'number' ? `${timeSpent} minutes` : 'No recorded time'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
