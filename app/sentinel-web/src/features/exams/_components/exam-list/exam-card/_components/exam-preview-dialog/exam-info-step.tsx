"use client";

import { Info } from "lucide-react";
import { Button, ScrollArea, cn } from "@sentinel/ui";
import { Exam } from "@sentinel/shared/types";

interface ExamInfoStepProps {
    exam: Exam;
    onStart: () => void;
    previewMode: "web" | "mobile";
}

export function ExamInfoStep({ exam, onStart, previewMode }: ExamInfoStepProps) {
    const questions = exam.questions || [];

    return (
        <ScrollArea className="h-full">
            <div className={cn(
                "mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-300",
                previewMode === "mobile" ? "p-4 sm:p-6 pt-8 sm:pt-12" : "p-5 sm:p-8 max-w-3xl"
            )}>
                <div className={cn(
                    "grid gap-3 sm:gap-4",
                    previewMode === "mobile" ? "grid-cols-2" : "grid-cols-4"
                )}>
                    <div className="bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#323d8f]/10 flex flex-col gap-1 items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-[8px] sm:text-[9px] uppercase font-black text-[#323d8f]/70 tracking-[0.1em]">Questions</span>
                        <span className="text-lg sm:text-2xl font-black text-[#323d8f]">{questions.length}</span>
                    </div>
                    <div className="bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#323d8f]/10 flex flex-col gap-1 items-center text-center hover:shadow-md transition-shadow">
                        <span className="text-[8px] sm:text-[9px] uppercase font-black text-[#323d8f]/70 tracking-[0.1em]">Duration</span>
                        <span className="text-lg sm:text-2xl font-black text-[#323d8f]">{exam.duration}m</span>
                    </div>
                    {previewMode !== "mobile" && (
                        <>
                            <div className="bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#323d8f]/10 flex flex-col gap-1 items-center text-center hover:shadow-md transition-shadow">
                                <span className="text-[8px] sm:text-[9px] uppercase font-black text-[#323d8f]/70 tracking-[0.1em]">Pass Mark</span>
                                <span className="text-lg sm:text-2xl font-black text-[#323d8f]">{exam.passingScore}%</span>
                            </div>
                            <div className="bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#323d8f]/10 flex flex-col gap-1 items-center text-center hover:shadow-md transition-shadow">
                                <span className="text-[8px] sm:text-[9px] uppercase font-black text-[#323d8f]/70 tracking-[0.1em]">Subject</span>
                                <span className="text-xs font-black text-[#323d8f] line-clamp-1 uppercase truncate w-full">{exam.subject}</span>
                            </div>
                        </>
                    )}
                </div>

                {previewMode === "mobile" && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#323d8f]/10 flex flex-col gap-1 items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-[8px] sm:text-[9px] uppercase font-black text-[#323d8f]/70 tracking-[0.1em]">Pass Mark</span>
                            <span className="text-lg font-black text-[#323d8f]">{exam.passingScore}%</span>
                        </div>
                        <div className="bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#323d8f]/10 flex flex-col gap-1 items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-[8px] sm:text-[9px] uppercase font-black text-[#323d8f]/70 tracking-[0.1em]">Subject</span>
                            <span className="text-[10px] font-black text-[#323d8f] line-clamp-2 uppercase truncate w-full">{exam.subject}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-bold text-sm sm:text-base">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#323d8f] shrink-0" />
                        <h2>Instructions</h2>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-lg sm:rounded-xl text-muted-foreground leading-relaxed text-[12px] sm:text-[13px] italic">
                        {exam.description || "No specific instructions provided for this examination."}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <Button
                        onClick={onStart}
                        className="w-full h-11 sm:h-12 text-xs sm:text-sm font-black bg-[#323d8f] hover:bg-[#323d8f]/90 transition-all rounded-lg sm:rounded-xl shadow-lg uppercase tracking-wider"
                        disabled={questions.length === 0}
                    >
                        Start Exam Simulation
                    </Button>
                    <p className="text-[8px] sm:text-[9px] text-center text-muted-foreground uppercase font-black tracking-widest">
                        {questions.length === 0 ? "Add questions before previewing" : "Answers are not recorded"}
                    </p>
                </div>
            </div>
        </ScrollArea>
    );
}
