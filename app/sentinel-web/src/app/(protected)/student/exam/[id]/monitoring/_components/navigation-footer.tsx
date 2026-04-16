'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { NavigationFooterProps } from '@sentinel/shared/types';

export function NavigationFooter({
    currentIndex,
    totalQuestions,
    answers,
    questions,
    onPrevious,
    onNext,
    onSubmit,
}: NavigationFooterProps) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    return (
        <div className="border-border/50 mx-auto mt-6 hidden w-full max-w-4xl items-center justify-between border-t pt-6 pb-10 sm:flex">
            <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={isFirst}
                className="h-10 gap-2 px-6 text-xs font-bold uppercase shadow-sm"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            {/* Progress Dots */}
            <div className="hidden gap-2 md:flex">
                {questions.map((q, i) => (
                    <div
                        key={i}
                        className={cn(
                            'h-2 w-2 rounded-full transition-all duration-300',
                            i === currentIndex
                                ? 'bg-primary w-8'
                                : answers[q.id] !== undefined
                                  ? 'bg-primary/40'
                                  : 'bg-muted',
                        )}
                    />
                ))}
            </div>

            {isLast ? (
                <Button
                    variant="default"
                    size="sm"
                    onClick={onSubmit}
                    className="h-10 bg-[#4752c4] px-8 text-xs font-bold text-white uppercase shadow-lg hover:bg-[#3d46a8]"
                >
                    Finish Exam
                </Button>
            ) : (
                <Button
                    size="sm"
                    onClick={onNext}
                    className="h-10 gap-2 bg-[#4752c4] px-8 text-xs font-bold text-white uppercase shadow-md hover:bg-[#3d46a8]"
                >
                    Next Item
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
