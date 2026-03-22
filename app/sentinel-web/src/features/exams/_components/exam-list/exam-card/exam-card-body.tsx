import { CardContent } from "@sentinel/ui";
import { Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { ExamCardProps } from "@sentinel/shared/types";

interface ExamCardBodyProps {
    exam: ExamCardProps["exam"];
}

export function ExamCardBody({ exam }: ExamCardBodyProps) {
    return (
        <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {/* Schedule date */}
                    <span>
                        {exam.scheduledDate
                            ? format(new Date(exam.scheduledDate), "MMM d, yyyy, h:mm a")
                            : "Not set"}
                    </span>
                </div>

                {/* Question count */}
                <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exam.questionCount || 0} Questions</span>
                </div>
            </div>
        </CardContent>
    );
}
