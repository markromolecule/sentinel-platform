import {
    Badge,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { FileText } from 'lucide-react';
import { AttemptReportView } from '@/features/exams/reports';
import type { AttemptGradingDetailType, GradingQuestionType } from '@sentinel/shared';

export type AttemptReportDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attempt: AttemptGradingDetailType;
    questions: GradingQuestionType[];
};

/**
 * Shows the released student attempt question table in a focused dialog.
 */
export function AttemptReportDialog({
    open,
    onOpenChange,
    attempt,
    questions,
}: AttemptReportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] w-[96vw] max-w-[96vw] flex-col overflow-hidden p-0 xl:max-w-[1360px]">
                <DialogHeader className="border-border/70 border-b px-6 py-5 text-left">
                    <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle>Detailed Report</DialogTitle>
                                <DialogDescription className="mt-1 max-w-2xl">
                                    Review the released question-level results for this attempt.
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="w-fit shrink-0">
                            {questions.length} question{questions.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-6">
                    <div className="border-border/70 overflow-hidden border">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1120px]">
                                <AttemptReportView
                                    attempt={attempt}
                                    questions={questions}
                                    showSummaryCards={false}
                                    showActions={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
