import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
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
            <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Detailed Report</DialogTitle>
                    <DialogDescription>
                        Review the released question-level results for this attempt.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[68vh] overflow-auto rounded-md border">
                    <AttemptReportView
                        attempt={attempt}
                        questions={questions}
                        showSummaryCards={false}
                        showActions={false}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
