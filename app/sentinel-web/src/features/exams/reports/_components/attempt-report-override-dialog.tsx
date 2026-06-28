import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Textarea,
} from '@sentinel/ui';
import { formatAnswerValue, type AttemptReportOverrideDrafts } from '../attempt-report-utils';
import type { ReportCardType } from '../_hooks/use-attempt-report/_types';

export type AttemptReportOverrideDialogProps = {
    selectedReport: ReportCardType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    overrideDraft?: AttemptReportOverrideDrafts[string];
    onOverrideChange: (questionId: string, field: 'awardedScore' | 'reason', value: string) => void;
    questionIndex: number;
};

/**
 * Renders the dialog modal for adjusting scores and adding override reasons.
 *
 * @param props - AttemptReportOverrideDialogProps
 */
export function AttemptReportOverrideDialog({
    selectedReport,
    open,
    onOpenChange,
    overrideDraft,
    onOverrideChange,
    questionIndex,
}: AttemptReportOverrideDialogProps) {
    if (!selectedReport) {
        return null;
    }

    const prompt = selectedReport.question?.content.prompt ?? selectedReport.prompt;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Adjust Score</DialogTitle>
                    <DialogDescription>
                        Adjust score for Question {questionIndex + 1}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Question Prompt</Label>
                            <div className="text-foreground text-sm font-medium">{prompt}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Student's Answer</Label>
                            <div className="bg-slate-50/50 border rounded-lg p-3 text-sm text-slate-800 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {formatAnswerValue(selectedReport.answer)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`override-score-${selectedReport.questionId}`}>
                                Override Score
                            </Label>
                            <Input
                                id={`override-score-${selectedReport.questionId}`}
                                type="number"
                                min={0}
                                max={selectedReport.maxScore}
                                step="0.1"
                                value={overrideDraft?.awardedScore ?? ''}
                                onChange={(event) =>
                                    onOverrideChange(
                                        selectedReport.questionId,
                                        'awardedScore',
                                        event.target.value,
                                    )
                                }
                                placeholder={String(selectedReport.maxScore)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`override-reason-${selectedReport.questionId}`}>
                                Override Reason
                            </Label>
                            <Textarea
                                id={`override-reason-${selectedReport.questionId}`}
                                className="min-h-[4rem] resize-none"
                                value={overrideDraft?.reason ?? ''}
                                onChange={(event) =>
                                    onOverrideChange(
                                        selectedReport.questionId,
                                        'reason',
                                        event.target.value,
                                    )
                                }
                                placeholder="Explain why this score was adjusted."
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90">Done</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
