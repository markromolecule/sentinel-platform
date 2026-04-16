'use client';

import { Flag, CheckCircle } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { QuestionDisplayProps } from '@sentinel/shared/types';

export function QuestionDisplay({
    question,
    questionNumber,
    totalQuestions,
    selectedAnswer,
    isFlagged,
    onAnswer,
    onToggleFlag,
}: QuestionDisplayProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto w-full max-w-4xl space-y-6 duration-300">
            <div className="border-border/50 flex items-center justify-between border-b pb-2">
                <span className="text-primary/70 text-[11px] font-bold tracking-widest uppercase">
                    Question {questionNumber} of {totalQuestions}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFlag}
                    className={cn(
                        'h-7 gap-2 px-3 text-[10px] font-bold uppercase',
                        isFlagged
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            : 'text-muted-foreground',
                    )}
                >
                    <Flag className={cn('h-3.5 w-3.5', isFlagged && 'fill-current')} />
                    {isFlagged ? 'Flagged' : 'Flag For Review'}
                </Button>
            </div>

            <div className="space-y-4">
                <h2 className="text-foreground/90 text-xl leading-tight font-bold md:text-2xl">
                    {question.text}
                </h2>

                <div className="grid gap-2.5 pt-2">
                    {question.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => onAnswer(question.id, i)}
                            className={cn(
                                'group flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all duration-150 sm:p-4',
                                selectedAnswer === i
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'bg-background border-border hover:border-primary/40 hover:bg-muted/30',
                            )}
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition-colors',
                                        selectedAnswer === i
                                            ? 'bg-primary border-primary text-white'
                                            : 'border-border/60 text-muted-foreground group-hover:border-primary/40',
                                    )}
                                >
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span
                                    className={cn(
                                        'text-base font-semibold',
                                        selectedAnswer === i
                                            ? 'text-primary'
                                            : 'text-muted-foreground/80',
                                    )}
                                >
                                    {option}
                                </span>
                            </div>
                            {selectedAnswer === i && (
                                <CheckCircle className="text-primary animate-in zoom-in h-5 w-5 duration-200" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
