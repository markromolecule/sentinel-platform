'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { getQuestionTypeMeta } from '@/features/exams/builder/_constants/question-type-meta';
import { cn } from '@sentinel/ui';
import type { QuestionTypeSelectorDialogProps } from '@/features/exams/builder/_components/_types';

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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {isLoading ? (
                        <div className="border-border/60 text-muted-foreground col-span-full rounded-lg border border-dashed p-6 text-sm">
                            Loading question types...
                        </div>
                    ) : questionTypes.length === 0 ? (
                        <div className="border-border/60 text-muted-foreground col-span-full rounded-lg border border-dashed p-6 text-sm">
                            No question types available right now.
                        </div>
                    ) : (
                        questionTypes.map((questionType) => {
                            const meta = getQuestionTypeMeta(questionType.value, questionType);
                            const Icon = meta.icon;
                            return (
                                <Button
                                    key={questionType.value}
                                    onClick={() => onSelect(questionType.value)}
                                    variant="outline"
                                    className={cn(
                                        'h-auto items-start justify-start gap-4 p-4 text-left whitespace-normal',
                                        'hover:bg-muted',
                                    )}
                                >
                                    <div className="border-border/60 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
                                        <Icon className="text-muted-foreground h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-base font-medium">
                                            {meta.label}
                                        </h3>
                                        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-snug">
                                            {meta.description}
                                        </p>
                                    </div>
                                </Button>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
