import { CardContent } from '@sentinel/ui';
import { Calendar, Clock3, FileText, MapPin, School } from 'lucide-react';
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
        <CardContent className="px-4">
            <div className="text-muted-foreground space-y-3 text-xs">
                {/* Classroom and Subject Section */}
                <div className="space-y-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <School className="text-primary/60 h-3.5 w-3.5 shrink-0" />
                        <span className="text-foreground/80 truncate font-medium">
                            {exam.subject || exam.classroomName || 'No subject assigned'}
                        </span>
                    </div>
                    {((exam.sectionNames && exam.sectionNames.length > 0) || exam.section) && (
                        <div className="flex min-w-0 items-center gap-2 pl-5.5">
                            <span className="truncate text-[11px] opacity-70">
                                {exam.sectionNames && exam.sectionNames.length > 0
                                    ? exam.sectionNames.join(' • ')
                                    : exam.section}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-border/40 border-t pt-2.5">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                        {/* Schedule - Start */}
                        <div className="flex min-w-0 items-center gap-1.5">
                            <Calendar className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
                            <span
                                className="truncate"
                                title={formatExamDateTime(exam.scheduledDate)}
                            >
                                {formatExamDateTime(exam.scheduledDate)}
                            </span>
                        </div>

                        {/* Location */}
                        <div className="flex min-w-0 items-center gap-1.5">
                            <MapPin className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
                            <span className="truncate" title={exam.room || 'No room assigned'}>
                                {exam.room ? `Room ${exam.room}` : 'No room'}
                            </span>
                        </div>

                        {/* Schedule - End */}
                        <div className="flex min-w-0 items-center gap-1.5">
                            <Clock3 className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
                            <span className="truncate" title={formatExamDateTime(exam.endDateTime)}>
                                {formatExamDateTime(exam.endDateTime)}
                            </span>
                        </div>

                        {/* Questions count */}
                        <div className="flex min-w-0 items-center gap-1.5">
                            <FileText className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                                {exam.questionCount || 0}{' '}
                                {exam.questionCount === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    );
}
