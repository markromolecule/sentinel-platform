import { Calendar, Clock } from 'lucide-react';
import { ExamInfoProps } from '@sentinel/shared/types';

export function ExamInfo({ title, dateTaken, timeSpent }: ExamInfoProps) {
    return (
        <div className="space-y-4">
            <h1 className="text-foreground text-3xl font-bold md:text-4xl">{title}</h1>

            <div className="flex flex-wrap gap-4">
                <div className="bg-muted/50 border-border/50 flex items-center gap-2 rounded-lg border px-3 py-1.5">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground/80 text-sm">
                        {new Date(dateTaken).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>
                <div className="bg-muted/50 border-border/50 flex items-center gap-2 rounded-lg border px-3 py-1.5">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground/80 text-sm">{timeSpent} minutes</span>
                </div>
            </div>
        </div>
    );
}
