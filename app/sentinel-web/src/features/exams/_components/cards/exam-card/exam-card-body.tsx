import { CardContent } from '@sentinel/ui';
import { Calendar, Clock3, FileText, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ExamCardProps } from '@sentinel/shared/types';

interface ExamCardBodyProps {
    exam: ExamCardProps['exam'];
}

function formatExamDateTime(value?: string) {
    if (!value) {
        return 'Not set';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return 'Not set';
    }

    return format(parsed, 'MMM d, yyyy, h:mm a');
}

export function ExamCardBody({ exam }: ExamCardBodyProps) {
    return (
        <CardContent className="pt-0">
            <div className="text-muted-foreground space-y-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                            Starts: {formatExamDateTime(exam.scheduledDate)}
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{exam.questionCount || 0} Questions</span>
                    </div>
                </div>

                <div className="flex min-w-0 items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Ends: {formatExamDateTime(exam.endDateTime)}</span>
                </div>

                <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                        {exam.room ? `Room: ${exam.room}` : 'Room: No room assigned'}
                    </span>
                </div>
            </div>
        </CardContent>
    );
}
