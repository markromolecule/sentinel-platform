"use client";

import { Check } from "lucide-react";
import { Input } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function Identification({ question, selectedAnswer, onAnswerChange, previewMode }: BaseQuestionProps) {
    const correctAnswer = question.content.correctAnswer as string || question.content.acceptedAnswers?.[0];

    return (
        <div className="space-y-3 sm:space-y-4">
            <div>
                <Input
                    placeholder="Type your answer here..."
                    value={(selectedAnswer as string) || ""}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    className="h-11 sm:h-14 px-4 sm:px-6 text-sm sm:text-lg font-bold bg-[#323d8f]/5 border-none focus-visible:ring-1 focus-visible:ring-[#323d8f]/30 rounded-lg sm:rounded-2xl placeholder:font-medium placeholder:text-muted-foreground/40"
                />
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[3] sm:stroke-[3]" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-800">Correct Answer</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 break-all">{correctAnswer}</span>
            </div>
        </div>
    );
}
