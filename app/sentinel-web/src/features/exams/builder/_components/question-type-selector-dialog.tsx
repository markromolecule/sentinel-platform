"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { QUESTION_TYPE_META } from "@/features/exams/builder/_constants/question-type-meta";
import type { QuestionType } from "@sentinel/shared/types";
import { cn } from "@/lib/utils";
import type { QuestionTypeSelectorDialogProps } from "@/features/exams/builder/_components/_types";

export function QuestionTypeSelectorDialog({
    open,
    onOpenChange,
    onSelect,
}: QuestionTypeSelectorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                {/* TODO: Implement dialog header */}
                <DialogHeader className="pb-4">
                    <DialogTitle>Select Question Type</DialogTitle>
                    <DialogDescription>
                        Choose the question type that best fits your evaluation goal.
                    </DialogDescription>
                </DialogHeader>

                {/* TODO: Implement question type selector dialog */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.entries(QUESTION_TYPE_META) as Array<
                        [QuestionType, (typeof QUESTION_TYPE_META)[QuestionType]]
                    >).map(([type, meta]) => {
                        const Icon = meta.icon;
                        return (
                            <Button
                                key={type}
                                onClick={() => onSelect(type)}
                                variant="outline"
                                className={cn(
                                    "h-auto items-start justify-start gap-3 p-4 text-left whitespace-normal",
                                    "hover:bg-muted"
                                )}
                            >
                                <div className="h-9 w-9 rounded-md border border-border/60 flex items-center justify-center shrink-0">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-medium">{meta.label}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                        {meta.description}
                                    </p>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
