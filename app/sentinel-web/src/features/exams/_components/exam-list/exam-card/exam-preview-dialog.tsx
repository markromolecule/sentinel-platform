"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    Badge,
    cn,
    Tabs,
    TabsList,
    TabsTrigger,
} from "@sentinel/ui";
import {
    Eye,
    Clock,
    FileText,
    Smartphone,
    Monitor,
} from "lucide-react";
import { Exam } from "@sentinel/shared/types";
import { useExamPreview } from "./_hooks/use-exam-preview";
import { ExamInfoStep } from "./_components/exam-preview-dialog/exam-info-step";
import { QuestionStep } from "./_components/exam-preview-dialog/question-step";

interface ExamPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam;
}

export function ExamPreviewDialog({ open, onOpenChange, exam }: ExamPreviewDialogProps) {
    const {
        currentStep,
        currentQuestionIndex,
        questions,
        selectedAnswers,
        previewMode,
        setPreviewMode,
        handleStart,
        handleNext,
        handlePrevious,
        handleAnswerChange,
        resetPreview
    } = useExamPreview(exam);

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetPreview();
            onOpenChange(val);
        }}>
            <DialogContent className={cn(
                "h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none rounded-lg sm:rounded-2xl shadow-2xl bg-background mx-2 sm:mx-0 transition-all duration-300",
                previewMode === "web" ? "sm:max-w-[65vw] max-w-full" : "sm:max-w-md max-w-full"
            )}>
                {/* Header Section */}
                <div className="bg-[#323d8f] text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

                    <div className={cn(
                        "flex flex-col gap-4 relative z-10 transition-all duration-300",
                        previewMode === "mobile" ? "sm:p-4 p-4 space-y-4" : "sm:p-6 p-4 space-y-4"
                    )}>
                        {/* Title and Info */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="p-1.5 bg-white/10 rounded-md">
                                    <Eye className="w-4 h-4 text-white" />
                                </div>
                                <Badge variant="outline" className="text-white/80 border-white/20 text-[10px] uppercase tracking-wider font-bold h-5 px-2">
                                    Instructor Preview
                                </Badge>
                                {currentStep === "questions" && (
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold h-5 px-2">
                                        Simulation Active
                                    </Badge>
                                )}
                            </div>
                            <DialogTitle className={cn(
                                "font-black tracking-tight text-white font-sans line-clamp-2",
                                previewMode === "mobile" ? "text-lg" : "text-xl sm:text-2xl"
                            )}>
                                {exam.title}
                            </DialogTitle>
                            <DialogDescription className="text-white/70 text-xs sm:text-sm line-clamp-1">
                                {currentStep === "info" ? "Review exam details and instructions." : "Simulating student exam experience."}
                            </DialogDescription>
                        </div>

                        {/* Controls Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <Tabs
                                value={previewMode}
                                onValueChange={(val) => setPreviewMode(val as "web" | "mobile")}
                                className="bg-white/10 p-1 rounded-lg border border-white/10 w-fit"
                            >
                                <TabsList className="bg-transparent h-7 sm:h-8 p-0 gap-1">
                                    <TabsTrigger
                                        value="web"
                                        className="h-6 sm:h-7 px-2.5 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#323d8f] text-white/70 hover:text-white transition-all rounded-md"
                                    >
                                        <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                        <span className="hidden sm:inline">Web</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="mobile"
                                        className="h-6 sm:h-7 px-2.5 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-[#323d8f] text-white/70 hover:text-white transition-all rounded-md"
                                    >
                                        <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                        <span className="hidden sm:inline">Mobile</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {currentStep === "questions" && (
                                <div className="flex items-center gap-2 sm:gap-4 text-white/80 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md shrink-0">
                                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/60 shrink-0" />
                                        <span className="whitespace-nowrap">{exam.duration}m</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md shrink-0">
                                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/60 shrink-0" />
                                        <span className="whitespace-nowrap">{currentQuestionIndex + 1}/{questions.length}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-[#f8fafc] flex justify-center items-center relative">
                    <div className={cn(
                        "transition-all duration-500 ease-in-out h-full w-full flex flex-col items-center justify-center",
                        previewMode === "mobile" ? "max-w-md border-x border-border/10 bg-white" : "p-0"
                    )}>
                        {currentStep === "info" ? (
                            <ExamInfoStep
                                exam={exam}
                                onStart={handleStart}
                                previewMode={previewMode}
                            />
                        ) : (
                            <QuestionStep
                                questions={questions}
                                currentIndex={currentQuestionIndex}
                                selectedAnswers={selectedAnswers}
                                previewMode={previewMode}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                onAnswerChange={handleAnswerChange}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
