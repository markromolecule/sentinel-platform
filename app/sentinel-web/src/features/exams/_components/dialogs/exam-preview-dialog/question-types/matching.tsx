"use client";

import { Layers, RotateCw, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@sentinel/ui";
import { BaseQuestionProps } from "../_types";

export function Matching({ question, previewMode }: BaseQuestionProps) {
    const pairs = question.content.pairs || [];

    return (
        <div className="space-y-2 sm:space-y-3">
            {pairs.map((pair, i) => (
                <div key={i} className={cn(
                    "flex items-center gap-2 sm:gap-3",
                    previewMode === "mobile" ? "flex-col" : "flex-row"
                )}>
                    <div className={cn(
                        "flex-1 p-3 sm:p-4 bg-white border-2 border-border/60 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-between",
                        previewMode === "mobile" ? "w-full" : ""
                    )}>
                        <span className="break-words">{pair.left}</span>
                        <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/30 shrink-0 ml-2" />
                    </div>
                    <div className="text-[#323d8f] font-black shrink-0">
                        {previewMode === "mobile" ? (
                            <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 rotate-90" />
                        ) : (
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                    </div>
                    <div className={cn(
                        "flex-1 p-3 sm:p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-emerald-800 shadow-sm flex items-center justify-between group relative",
                        previewMode === "mobile" ? "w-full" : ""
                    )}>
                        <span className="break-words">{pair.right}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 ml-2" />
                        <div className="absolute -top-2 -right-2 bg-emerald-600 text-[7px] sm:text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm whitespace-nowrap">Match</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
