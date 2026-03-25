"use client";

import { Input, cn } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function FillBlank({ question, previewMode }: BaseQuestionProps) {
    const prompt = question.content.prompt || "";
    const blanks = question.content.blanks || [];

    return (
        <div className="space-y-4 bg-white border-2 border-border/40 p-4 sm:p-6 rounded-lg sm:rounded-2xl">
            <div className={cn(
                "font-bold leading-relaxed sm:leading-loose flex flex-wrap gap-1 sm:gap-2 items-center",
                previewMode === "mobile" ? "text-xs" : "text-base"
            )}>
                {prompt.split(/_{3,}/).map((text, i, arr) => (
                    <span key={i} className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        {text}
                        {i < arr.length - 1 && (
                            <span className="relative inline-block">
                                <Input 
                                    className={cn(
                                        "p-1 text-center font-black border-x-0 border-t-0 border-b-2 border-[#323d8f] rounded-none focus-visible:ring-0 bg-[#323d8f]/5",
                                        previewMode === "mobile" ? "h-7 w-20 text-[10px]" : "h-8 w-32 text-xs"
                                    )}
                                    placeholder={`Blank ${i+1}`}
                                />
                                <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-[7px] sm:text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 sm:px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap z-10">
                                    {blanks[i] || "Answer"}
                                </div>
                            </span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}
