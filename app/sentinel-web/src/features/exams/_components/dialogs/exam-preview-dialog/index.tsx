'use client';

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
} from '@sentinel/ui';
import { Eye, Clock, FileText, Smartphone, Monitor } from 'lucide-react';
import { Exam } from '@sentinel/shared/types';
import { useExamPreview } from './hooks/use-exam-preview';
import { ExamInfoStep } from './exam-info-step';
import { QuestionStep } from './question-step';

interface ExamPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam | null;
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
        resetPreview,
    } = useExamPreview(exam);

    if (!exam) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!val) resetPreview();
                onOpenChange(val);
            }}
        >
            <DialogContent
                className={cn(
                    'bg-background mx-2 flex h-[90vh] flex-col gap-0 overflow-hidden rounded-lg border-none p-0 shadow-2xl transition-all duration-300 sm:mx-0 sm:rounded-2xl',
                    previewMode === 'web' ? 'max-w-full sm:max-w-[65vw]' : 'max-w-full sm:max-w-md',
                )}
            >
                {/* Header Section */}
                <div className="relative shrink-0 overflow-hidden bg-[#323d8f] text-white">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

                    <div
                        className={cn(
                            'relative z-10 flex flex-col gap-4 transition-all duration-300',
                            previewMode === 'mobile'
                                ? 'space-y-4 p-4 sm:p-4'
                                : 'space-y-4 p-4 sm:p-6',
                        )}
                    >
                        {/* Title and Info */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="rounded-md bg-white/10 p-1.5">
                                    <Eye className="h-4 w-4 text-white" />
                                </div>
                                <Badge
                                    variant="outline"
                                    className="h-5 border-white/20 px-2 text-[10px] font-bold tracking-wider text-white/80 uppercase"
                                >
                                    Instructor Preview
                                </Badge>
                                {currentStep === 'questions' && (
                                    <Badge
                                        variant="outline"
                                        className="h-5 border-emerald-500/20 bg-emerald-500/10 px-2 text-[10px] font-bold tracking-wider text-emerald-400 uppercase"
                                    >
                                        Simulation Active
                                    </Badge>
                                )}
                            </div>
                            <DialogTitle
                                className={cn(
                                    'line-clamp-2 font-sans font-black tracking-tight text-white',
                                    previewMode === 'mobile' ? 'text-lg' : 'text-xl sm:text-2xl',
                                )}
                            >
                                {exam.title}
                            </DialogTitle>
                            <DialogDescription className="line-clamp-1 text-xs text-white/70 sm:text-sm">
                                {currentStep === 'info'
                                    ? 'Review exam details and instructions.'
                                    : 'Simulating student exam experience.'}
                            </DialogDescription>
                        </div>

                        {/* Controls Row */}
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <Tabs
                                value={previewMode}
                                onValueChange={(val) => setPreviewMode(val as 'web' | 'mobile')}
                                className="w-fit rounded-lg border border-white/10 bg-white/10 p-1"
                            >
                                <TabsList className="h-7 gap-1 bg-transparent p-0 sm:h-8">
                                    <TabsTrigger
                                        value="web"
                                        className="h-6 rounded-md px-2.5 text-[9px] font-bold tracking-wider text-white/70 uppercase transition-all hover:text-white data-[state=active]:bg-white data-[state=active]:text-[#323d8f] sm:h-7 sm:px-3 sm:text-[10px]"
                                    >
                                        <Monitor className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        <span className="hidden sm:inline">Web</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="mobile"
                                        className="h-6 rounded-md px-2.5 text-[9px] font-bold tracking-wider text-white/70 uppercase transition-all hover:text-white data-[state=active]:bg-white data-[state=active]:text-[#323d8f] sm:h-7 sm:px-3 sm:text-[10px]"
                                    >
                                        <Smartphone className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        <span className="hidden sm:inline">Mobile</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {currentStep === 'questions' && (
                                <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-white/80 uppercase sm:gap-4 sm:text-[11px]">
                                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                                        <Clock className="h-3 w-3 shrink-0 text-white/60 sm:h-3.5 sm:w-3.5" />
                                        <span className="whitespace-nowrap">{exam.duration}m</span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                                        <FileText className="h-3 w-3 shrink-0 text-white/60 sm:h-3.5 sm:w-3.5" />
                                        <span className="whitespace-nowrap">
                                            {currentQuestionIndex + 1}/{questions.length}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#f8fafc]">
                    <div
                        className={cn(
                            'flex h-full w-full flex-col items-center justify-center transition-all duration-500 ease-in-out',
                            previewMode === 'mobile'
                                ? 'border-border/10 max-w-md border-x bg-white'
                                : 'p-0',
                        )}
                    >
                        {currentStep === 'info' ? (
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
