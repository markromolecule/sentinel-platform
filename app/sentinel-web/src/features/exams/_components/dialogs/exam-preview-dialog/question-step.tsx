'use client';

import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Button, ScrollArea, Badge, cn } from '@sentinel/ui';
import { Exam } from '@sentinel/shared/types';
import {
    MultipleChoice,
    MultipleResponse,
    TrueFalse,
    Identification,
    Essay,
    FillBlank,
    Matching,
    Enumeration,
} from './question-types';
import { BaseQuestionProps, AnswerValue } from './_types';

interface QuestionStepProps {
    questions: NonNullable<Exam['questions']>;
    currentIndex: number;
    selectedAnswers: Record<string, AnswerValue>;
    previewMode: 'web' | 'mobile';
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
    onAnswerChange,
}: QuestionStepProps) {
    const question = questions[currentIndex];
    if (!question) return null;

    const renderQuestion = () => {
        const props: BaseQuestionProps = {
            question,
            selectedAnswer: selectedAnswers[question.id],
            onAnswerChange: (val) => onAnswerChange(question.id, val),
            previewMode,
        };

        switch (question.type) {
            case 'MULTIPLE_CHOICE':
                return <MultipleChoice {...props} />;
            case 'MULTIPLE_RESPONSE':
                return <MultipleResponse {...props} />;
            case 'TRUE_FALSE':
                return <TrueFalse {...props} />;
            case 'IDENTIFICATION':
                return <Identification {...props} />;
            case 'ESSAY':
                return <Essay {...props} />;
            case 'FILL_BLANK':
                return <FillBlank {...props} />;
            case 'MATCHING':
                return <Matching {...props} />;
            case 'ENUMERATION':
                return <Enumeration {...props} />;
            default:
                return (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                        <HelpCircle className="h-10 w-10 text-amber-500" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black tracking-widest text-amber-800 uppercase">
                                Preview Scheduled
                            </p>
                            <p className="text-xs font-medium text-amber-700/70">
                                Visualization for this type is coming soon.
                            </p>
                        </div>
                        <div className="mt-2 w-full rounded-b-xl border-t border-amber-200 bg-white/50 p-4 pt-4">
                            <p className="mb-2 text-[9px] font-black tracking-widest text-amber-900 uppercase">
                                Answer Reference
                            </p>
                            <p className="text-xs font-bold break-all text-emerald-700">
                                {JSON.stringify(
                                    question.content.correctAnswer ||
                                        question.content.acceptedAnswers,
                                )}
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="animate-in slide-in-from-right-8 flex h-full flex-col duration-300">
            <ScrollArea className="flex-1">
                <div
                    className={cn(
                        'mx-auto space-y-5 sm:space-y-6',
                        previewMode === 'mobile'
                            ? 'p-4 pt-8 sm:p-5 sm:pt-10'
                            : 'max-w-4xl p-6 sm:p-8',
                    )}
                >
                    <div className="border-border/50 flex flex-wrap items-center justify-between gap-3 border-b pb-3 sm:pb-4">
                        <span className="shrink-0 rounded-full bg-[#323d8f]/5 px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-[#323d8f]/70 uppercase sm:px-3 sm:text-[10px]">
                            Q{currentIndex + 1} of {questions.length}
                        </span>
                        <Badge
                            variant="secondary"
                            className="border-none bg-amber-100 px-2 py-0.5 text-[8px] font-black tracking-wider whitespace-nowrap text-amber-700 uppercase hover:bg-amber-100 sm:px-3 sm:text-[9px]"
                        >
                            {question.type?.replace('_', ' ') || 'QUESTION'}
                        </Badge>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <h3
                            className={cn(
                                'text-foreground/90 leading-snug font-bold break-words sm:leading-relaxed',
                                previewMode === 'mobile' ? 'text-base' : 'text-lg sm:text-2xl',
                            )}
                        >
                            {question.content.prompt}
                        </h3>

                        <div className="grid gap-3 sm:gap-4">{renderQuestion()}</div>
                    </div>
                </div>
            </ScrollArea>

            <div
                className={cn(
                    'border-border/60 z-50 flex shrink-0 items-center justify-between gap-2 overflow-x-auto border-t bg-white p-4 shadow-[0_-4px_20px_0_rgba(0,0,0,0.03)] sm:p-6',
                    previewMode === 'mobile' ? 'min-h-16 sm:h-20' : 'min-h-20 sm:h-24',
                )}
            >
                <Button
                    variant="ghost"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="group h-9 shrink-0 gap-1 rounded-lg px-3 text-[9px] font-black tracking-widest uppercase transition-all hover:bg-[#323d8f]/5 sm:h-11 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-[11px] md:px-6"
                >
                    <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="hidden max-w-[150px] flex-shrink-0 justify-center gap-1.5 overflow-x-auto px-2 sm:flex sm:max-w-[300px]">
                    {questions.length <= 20 ? (
                        questions.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'shrink-0 rounded-full transition-all duration-300',
                                    i === currentIndex
                                        ? 'h-2 w-6 bg-[#323d8f]'
                                        : 'h-2 w-2 bg-[#323d8f]/10 hover:bg-[#323d8f]/30',
                                )}
                            />
                        ))
                    ) : (
                        <span className="text-muted-foreground text-[9px] font-black whitespace-nowrap uppercase sm:text-[10px]">
                            {currentIndex + 1} / {questions.length}
                        </span>
                    )}
                </div>

                <Button
                    onClick={onNext}
                    disabled={currentIndex === questions.length - 1}
                    className="group h-9 shrink-0 gap-1 rounded-lg bg-[#323d8f] px-3 text-[9px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-[#323d8f]/90 sm:h-11 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-[11px] md:px-6"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
                </Button>
            </div>
        </div>
    );
}
