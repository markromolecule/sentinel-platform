"use client";

import { ListChecks, Check } from "lucide-react";
import { Button, Input } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function Enumeration({ question, previewMode }: BaseQuestionProps) {
    const acceptedAnswers = question.content.acceptedAnswers || [];
    const count = Math.max(acceptedAnswers.length, 3);

    return (
        <div className="grid gap-2 sm:gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="relative group">
                    <div className={cn(
                        "absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#323d8f]/10 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-[#323d8f] shrink-0",
                        previewMode === "mobile" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]"
                    )}>
                        {i + 1}
                    </div>
                    <Input 
                        placeholder={`Item ${i + 1}`}
                        className={cn(
                            "pl-10 sm:pl-12 pr-4 bg-white border-2 border-border/60 rounded-lg sm:rounded-xl font-bold focus-visible:ring-[#323d8f]",
                            previewMode === "mobile" ? "h-10 text-xs" : "h-12 text-sm"
                        )}
                    />
                    {acceptedAnswers[i] && (
                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="text-[7px] sm:text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 whitespace-nowrap">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                {acceptedAnswers[i]}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <Button variant="ghost" className="h-9 sm:h-10 border-2 border-dashed border-border/60 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold text-muted-foreground hover:bg-white flex gap-1.5 sm:gap-2">
                <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Add Another Item
            </Button>
        </div>
    );
}
