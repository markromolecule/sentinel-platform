'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { MobileNavigationProps } from '@sentinel/shared/types';

export function MobileNavigation({
    currentIndex,
    totalQuestions,
    onPrevious,
    onNext,
    onSubmit,
}: MobileNavigationProps) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    return (
        <div className="bg-background sticky bottom-0 z-50 flex w-full items-center justify-between border-t px-6 py-3 shadow-2xl lg:hidden">
            <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-full p-0"
                onClick={onPrevious}
                disabled={isFirst}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="bg-muted/50 border-border/50 rounded-full border px-5 py-2 font-mono text-xs font-black tracking-widest">
                {currentIndex + 1} OF {totalQuestions}
            </div>

            {isLast ? (
                <Button
                    variant="default"
                    size="sm"
                    className="h-10 px-6 text-xs font-black uppercase"
                    onClick={onSubmit}
                >
                    Finish
                </Button>
            ) : (
                <Button size="sm" className="h-10 w-10 rounded-full p-0" onClick={onNext}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}
