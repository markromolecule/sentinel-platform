"use client";

import { Check } from "lucide-react";
import { cn } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function MultipleChoice({ question, selectedAnswer, onAnswerChange, previewMode }: BaseQuestionProps) {
    const options = question.content.options || [];
    const correctAnswer = question.content.correctAnswer;

    return (
        <div className="grid gap-2 sm:gap-3">
            {options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = correctAnswer === i;

                return (
                    <button
                        key={i}
                        onClick={() => onAnswerChange(i)}
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
                                    ? "bg-[#323d8f] border-[#323d8f] text-white rotate-3"
                                    : "bg-[#f8fafc] border-border text-muted-foreground group-hover:rotate-1"
                            )}>
                                <span>{String.fromCharCode(65 + i)}</span>
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
