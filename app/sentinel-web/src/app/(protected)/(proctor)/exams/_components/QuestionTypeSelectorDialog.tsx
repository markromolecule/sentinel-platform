"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { QUESTION_TYPE_META } from "../question-meta";
import type { QuestionType } from "../types";
import { cn } from "@/lib/utils";

interface QuestionTypeSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (type: QuestionType) => void;
}

export const QuestionTypeSelectorDialog = ({
    open,
    onOpenChange,
    onSelect,
}: QuestionTypeSelectorDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl sm:rounded-3xl border-border/50 bg-background/95 backdrop-blur-2xl">
                <DialogHeader className="text-center pb-6">
                    <DialogTitle className="text-3xl font-extrabold tracking-tight">Add a Question</DialogTitle>
                    <DialogDescription className="text-base">
                        Choose the question type that best fits your evaluation goal.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {(Object.entries(QUESTION_TYPE_META) as [QuestionType, typeof QUESTION_TYPE_META["multiple_choice"]][]).map(([type, meta]) => {
                        const Icon = meta.icon;
                        return (
                            <button
                                key={type}
                                onClick={() => onSelect(type)}
                                className={cn(
                                    "flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-secondary/20 transition-all duration-300",
                                    "hover:bg-primary/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 group active:scale-[0.98]"
                                )}
                            >
                                <div className="h-14 w-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 shadow-sm">
                                    <Icon className="h-7 w-7 text-primary transition-transform duration-500" />
                                </div>
                                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{meta.label}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {meta.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};
