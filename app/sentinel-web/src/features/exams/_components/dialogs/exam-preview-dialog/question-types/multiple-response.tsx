"use client";

import { Check } from "lucide-react";
import { cn } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function MultipleResponse({ question, selectedAnswer, onAnswerChange, previewMode }: BaseQuestionProps) {
    const options = question.content.options || [];
    const correctAnswers = (question.content.correctAnswer as (string | number)[]) || [];
    const selected = (selectedAnswer as (string | number)[]) || [];

    const handleToggle = (i: number) => {
        const next = selected.includes(i)
            ? selected.filter(x => x !== i)
            : [...selected, i];
        onAnswerChange(next);
    };

    return (
        <div className="grid gap-2 sm:gap-3">
            {options.map((option, i) => {
                const isSelected = selected.includes(i);
                const isCorrect = correctAnswers.includes(i);

                return (
                    <button
                        key={i}
                        onClick={() => handleToggle(i)}
                        className={cn(
                            "group flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all duration-200 relative",
                            isSelected
                                ? "bg-[#323d8f]/5 border-[#323d8f] shadow-md"
                                : "bg-white border-border/60 hover:border-[#323d8f]/40 hover:bg-[#323d8f]/5 hover:shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className={cn(
                                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border font-black text-xs sm:text-sm transition-all shrink-0",
                                isSelected
                                    ? "bg-[#323d8f] border-[#323d8f] text-white"
                                    : "bg-[#f8fafc] border-border text-muted-foreground"
                            )}>
                                <div className={cn(
                                    "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-colors",
                                    isSelected ? "bg-white border-white" : "border-muted-foreground/30"
                                )}>
                                    {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#323d8f] stroke-[3] sm:stroke-[4]" />}
                                </div>
                            </div>
                            <span className={cn(
                                "text-xs sm:text-sm font-bold transition-colors break-words",
                                isSelected ? "text-[#323d8f]" : "text-muted-foreground"
                            )}>
                                {option}
                            </span>
                        </div>

                        {isCorrect && (
                            <div className="absolute -top-2.5 -right-2.5 bg-emerald-500 text-white rounded-full p-1 shadow-lg border-2 border-white animate-in zoom-in duration-300 z-10 shrink-0" title="Correct Answer (Instructor Insight)">
                                <Check className="w-3 h-3 stroke-[4]" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
