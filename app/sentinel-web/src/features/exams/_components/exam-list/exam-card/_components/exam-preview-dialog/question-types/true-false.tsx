"use client";

import { Check } from "lucide-react";
import { Button, cn } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function TrueFalse({ question, selectedAnswer, onAnswerChange, previewMode }: BaseQuestionProps) {
    const correctBoolean = question.content.correctBoolean;

    return (
        <div className={cn(
            "flex gap-2 sm:gap-4",
            previewMode === "mobile" ? "flex-col" : "flex-row"
        )}>
            {[true, false].map((val) => (
                <Button
                    key={val.toString()}
                    variant={selectedAnswer === val ? "default" : "outline"}
                    className={cn(
                        "flex-1 h-11 sm:h-14 text-xs sm:text-sm font-black rounded-lg sm:rounded-xl border-2 transition-all uppercase tracking-widest",
                        selectedAnswer === val
                            ? "bg-[#323d8f] border-[#323d8f] shadow-md text-white"
                            : "bg-white border-border/60 hover:bg-[#323d8f]/5"
                    )}
                    onClick={() => onAnswerChange(val)}
                >
                    {val ? 'True' : 'False'}
                    {correctBoolean === val && (
                        <div className="ml-2 bg-emerald-400 text-white rounded-full p-0.5 shadow-sm shrink-0" title="Correct Answer">
                            <Check className="w-3 h-3 stroke-[4]" />
                        </div>
                    )}
                </Button>
            ))}
        </div>
    );
}
