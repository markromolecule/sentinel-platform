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
        <CardContent className="pt-0">
            <div className="text-muted-foreground space-y-4 text-xs">
                {/* Classroom and Subject Section */}
                <div className="space-y-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                        <School className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate font-medium text-foreground/80">
                            {exam.subject || exam.classroomName || 'No subject assigned'}
                        </span>
                    </div>
                    {((exam.sectionNames && exam.sectionNames.length > 0) || exam.section) && (
                        <div className="flex min-w-0 items-center gap-2 pl-5">
                            <span className="truncate text-[11px] opacity-70">
                                {exam.sectionNames && exam.sectionNames.length > 0 
                                    ? exam.sectionNames.join(' • ') 
                                    : exam.section}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t border-border/40 pt-3">
                    <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4">
                        {/* Schedule Column */}
                        <div className="space-y-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                                        Starts
                                    </span>
                                    <span className="truncate">
                                        {formatExamDateTime(exam.scheduledDate)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                                <Clock3 className="h-3.5 w-3.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                                        Ends
                                    </span>
                                    <span className="truncate">
                                        {formatExamDateTime(exam.endDateTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location and Metadata Column */}
                        <div className="space-y-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                                        Location
                                    </span>
                                    <span className="truncate">
                                        {exam.room ? `Room ${exam.room}` : 'No room assigned'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                                        Questions
                                    </span>
                                    <span>{exam.questionCount || 0} Items</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    );
}
