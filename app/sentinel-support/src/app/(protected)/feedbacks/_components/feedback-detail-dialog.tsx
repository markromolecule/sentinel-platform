'use client';

import type { FeedbackRecord } from '@sentinel/services';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Badge,
} from '@sentinel/ui';

export function FeedbackDetailDialog({
    feedback,
    open,
    onOpenChange,
}: {
    feedback: FeedbackRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="text-left">
                    <DialogTitle>Feedback Details</DialogTitle>
                    <DialogDescription>
                        Review the full student response for this completed attempt.
                    </DialogDescription>
                </DialogHeader>

                {feedback ? (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">Rating: {feedback.rating}/5</Badge>
                            {feedback.examTitle ? <Badge variant="outline">{feedback.examTitle}</Badge> : null}
                            {feedback.institutionName ? (
                                <Badge variant="outline">{feedback.institutionName}</Badge>
                            ) : null}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Student</p>
                                <p className="mt-1 text-sm font-medium">{feedback.studentName ?? 'Unknown student'}</p>
                                <p className="text-muted-foreground text-sm">{feedback.studentEmail ?? 'No email'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Submitted</p>
                                <p className="mt-1 text-sm font-medium">
                                    {new Date(feedback.createdAt).toLocaleString()}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Attempt ID: {feedback.attemptId}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-muted-foreground text-xs uppercase">Experience</p>
                            <div className="bg-muted/30 rounded-xl border p-4 text-sm leading-6">
                                {feedback.experience?.trim() || 'No written experience provided.'}
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
