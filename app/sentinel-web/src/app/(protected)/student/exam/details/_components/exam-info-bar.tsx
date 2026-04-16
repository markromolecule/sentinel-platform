import { BookOpen, Clock, User } from 'lucide-react';
import { ExamInfoBarProps } from '@sentinel/shared/types';

export function ExamInfoBar({ exam }: ExamInfoBarProps) {
    return (
        <div className="border-border/50 flex flex-wrap items-center gap-x-8 gap-y-4 border-b pb-8">
            <div className="space-y-1">
                <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Subject
                </span>
                <div className="text-foreground flex items-center gap-2 text-lg font-medium">
                    <BookOpen className="text-primary h-5 w-5" />
                    {exam.subject}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Duration
                </span>
                <div className="text-foreground flex items-center gap-2 text-lg font-medium">
                    <Clock className="text-primary h-5 w-5" />
                    {exam.duration} Minutes
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Proctored By
                </span>
                <div className="text-foreground flex items-center gap-2 text-lg font-medium">
                    <User className="text-primary h-5 w-5" />
                    {exam.professor}
                </div>
            </div>
        </div>
    );
}
