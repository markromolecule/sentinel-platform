"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { getQuestionTypeMeta } from "@/features/exams/builder/_constants/question-type-meta";
import { cn } from "@/lib/utils";
import type { QuestionTypeSelectorDialogProps } from "@/features/exams/builder/_components/_types";

export function QuestionTypeSelectorDialog({
    open,
    onOpenChange,
    questionTypes = [],
    isLoading = false,
    onSelect,
}: QuestionTypeSelectorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-5xl lg:max-w-6xl">
                {/* TODO: Implement dialog header */}
                <DialogHeader className="pb-2">
                    <DialogTitle>Select Question Type</DialogTitle>
                    <DialogDescription>
                        Choose the question type that best fits your evaluation goal.
                    </DialogDescription>
                </DialogHeader>

                {/* TODO: Implement question type selector dialog */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isLoading ? (
                        <div className="col-span-full rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                            Loading question types...
                        </div>
                    ) : questionTypes.length === 0 ? (
                        <div className="col-span-full rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                            No question types available right now.
                        </div>
                    ) : questionTypes.map((questionType) => {
                        const meta = getQuestionTypeMeta(questionType.value, questionType);
                        const Icon = meta.icon;
                        return (
                            <Button
                                key={questionType.value}
                                onClick={() => onSelect(questionType.value)}
                                variant="outline"
                                className={cn(
                                    "h-auto items-start justify-start gap-4 p-4 text-left whitespace-normal",
                                    "hover:bg-muted"
                                )}
                            >
                                <div className="h-10 w-10 rounded-md border border-border/60 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-medium truncate">{meta.label}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-snug">
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
