import { Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import type { ExamReport } from '@sentinel/shared/types';
import { formatDateTime } from '../_helpers/report-helpers';

interface ExamWindowCardProps {
    exam: ExamReport['exam'];
}

export function ExamWindowCard({ exam }: ExamWindowCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Exam Window</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span>Start</span>
                    <span className="text-foreground text-right">
                        {formatDateTime(exam.scheduledDate)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span>End</span>
                    <span className="text-foreground text-right">
                        {formatDateTime(exam.endDateTime)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span>Duration</span>
                    <span className="text-foreground text-right">
                        {exam.durationMinutes} minutes
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span>Passing Score</span>
                    <span className="text-foreground text-right">{exam.passingScore}%</span>
                </div>
            </CardContent>
        </Card>
    );
}
