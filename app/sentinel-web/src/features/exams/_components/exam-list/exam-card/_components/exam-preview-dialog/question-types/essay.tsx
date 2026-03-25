"use client";

import { AlignLeft } from "lucide-react";
import { Textarea } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function Essay({ question, selectedAnswer, onAnswerChange, previewMode }: BaseQuestionProps) {
    const rubric = question.content.rubric;

    return (
        <div className="space-y-3 sm:space-y-4">
            <Textarea
                placeholder="Write your essay here..."
                value={(selectedAnswer as string) || ""}
                onChange={(e) => onAnswerChange(e.target.value)}
                className={cn(
                    "p-4 sm:p-6 text-sm sm:text-base font-medium bg-[#323d8f]/5 border-none focus-visible:ring-1 focus-visible:ring-[#323d8f]/30 rounded-lg sm:rounded-2xl placeholder:text-muted-foreground/40 resize-none leading-relaxed",
                    previewMode === "mobile" ? "min-h-[150px]" : "min-h-[200px]"
                )}
            />
            <div className="flex justify-end pt-1 sm:pt-2">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    Characters: {typeof selectedAnswer === 'string' ? selectedAnswer.length : 0}
                </span>
            </div>
            {rubric && (
                <div className="bg-amber-50 border border-amber-100 p-3 sm:p-4 rounded-lg sm:rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 shrink-0">
                        <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Grading Rubric</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-amber-700/80 leading-relaxed italic">{rubric}</p>
                </div>
            )}
        </div>
    );
}
