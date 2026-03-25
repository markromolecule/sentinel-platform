"use client";

import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Button, ScrollArea, Badge, cn } from "@sentinel/ui";
import { Exam } from "@sentinel/shared/types";
import {
    MultipleChoice,
    MultipleResponse,
    TrueFalse,
    Identification,
    Essay,
    FillBlank,
    Matching,
    Enumeration
} from "./question-types";
import { BaseQuestionProps, AnswerValue } from "./_types";

interface QuestionStepProps {
    questions: NonNullable<Exam["questions"]>;
    currentIndex: number;
    selectedAnswers: Record<string, AnswerValue>;
    previewMode: "web" | "mobile";
    onNext: () => void;
    onPrevious: () => void;
    onAnswerChange: (questionId: string, answer: AnswerValue) => void;
}

export function QuestionStep({
    questions,
    currentIndex,
    selectedAnswers,
    previewMode,
    onNext,
    onPrevious,
    onAnswerChange
}: QuestionStepProps) {
    const question = questions[currentIndex];
    if (!question) return null;

    const renderQuestion = () => {
        const props: BaseQuestionProps = {
            question,
            selectedAnswer: selectedAnswers[question.id],
            onAnswerChange: (val) => onAnswerChange(question.id, val),
            previewMode
        };

        switch (question.type) {
            case 'MULTIPLE_CHOICE': return <MultipleChoice {...props} />;
            case 'MULTIPLE_RESPONSE': return <MultipleResponse {...props} />;
            case 'TRUE_FALSE': return <TrueFalse {...props} />;
            case 'IDENTIFICATION': return <Identification {...props} />;
            case 'ESSAY': return <Essay {...props} />;
            case 'FILL_BLANK': return <FillBlank {...props} />;
            case 'MATCHING': return <Matching {...props} />;
            case 'ENUMERATION': return <Enumeration {...props} />;
            default:
                return (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
                        <HelpCircle className="w-10 h-10 text-amber-500" />
                        <div className="space-y-1">
                            <p className="font-black text-amber-800 uppercase tracking-widest text-[11px]">Preview Scheduled</p>
                            <p className="text-xs text-amber-700/70 font-medium">Visualization for this type is coming soon.</p>
                        </div>
                        <div className="mt-2 pt-4 border-t border-amber-200 w-full bg-white/50 rounded-b-xl p-4">
                            <p className="text-[9px] uppercase font-black tracking-widest text-amber-900 mb-2">Answer Reference</p>
                            <p className="text-xs font-bold text-emerald-700 break-all">{JSON.stringify(question.content.correctAnswer || question.content.acceptedAnswers)}</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
            <ScrollArea className="flex-1">
                <div className={cn(
                    "mx-auto space-y-5 sm:space-y-6",
                    previewMode === "mobile" ? "p-4 sm:p-5 pt-8 sm:pt-10" : "p-6 sm:p-8 max-w-4xl"
                )}>
                    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 sm:pb-4 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] text-[#323d8f]/70 bg-[#323d8f]/5 px-2.5 sm:px-3 py-1 rounded-full shrink-0">
                            Q{currentIndex + 1} of {questions.length}
                        </span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 sm:px-3 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                            {question.type?.replace('_', ' ') || 'QUESTION'}
                        </Badge>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <h3 className={cn(
                            "font-bold leading-snug sm:leading-relaxed text-foreground/90 break-words",
                            previewMode === "mobile" ? "text-base" : "text-lg sm:text-2xl"
                        )}>
                            {question.content.prompt}
                        </h3>

                        <div className="grid gap-3 sm:gap-4">
                            {renderQuestion()}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className={cn(
                "p-4 sm:p-6 bg-white border-t border-border/60 shrink-0 flex items-center justify-between gap-2 shadow-[0_-4px_20px_0_rgba(0,0,0,0.03)] z-50 overflow-x-auto",
                previewMode === "mobile" ? "min-h-16 sm:h-20" : "min-h-20 sm:h-24"
            )}>
                <Button
                    variant="ghost"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="h-9 sm:h-11 px-3 sm:px-4 md:px-6 text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-[#323d8f]/5 rounded-lg sm:rounded-xl gap-1 sm:gap-2 group transition-all shrink-0"
                >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="hidden sm:flex gap-1.5 overflow-x-auto max-w-[150px] sm:max-w-[300px] justify-center flex-shrink-0 px-2">
                    {questions.length <= 20 ? questions.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "rounded-full transition-all duration-300 shrink-0",
                                i === currentIndex ? "w-6 h-2 bg-[#323d8f]" : "w-2 h-2 bg-[#323d8f]/10 hover:bg-[#323d8f]/30"
                            )}
                        />
                    )) : (
                        <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase whitespace-nowrap">{currentIndex + 1} / {questions.length}</span>
                    )}
                </div>

                <Button
                    onClick={onNext}
                    disabled={currentIndex === questions.length - 1}
                    className="h-9 sm:h-11 px-3 sm:px-4 md:px-6 text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-[#323d8f] hover:bg-[#323d8f]/90 text-white rounded-lg sm:rounded-xl shadow-lg gap-1 sm:gap-2 group transition-all shrink-0"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
