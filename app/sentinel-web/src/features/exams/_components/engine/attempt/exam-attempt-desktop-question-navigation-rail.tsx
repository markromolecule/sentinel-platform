'use client';

import type { ReactNode } from 'react';
import { cn } from '@sentinel/ui';
import { useQuestionNavigationDragScroll } from './use-question-navigation-drag-scroll';

type ExamAttemptDesktopQuestionNavigationRailProps = {
    questionRail: ReactNode;
};

export function ExamAttemptDesktopQuestionNavigationRail({
    questionRail,
}: ExamAttemptDesktopQuestionNavigationRailProps) {
    const { scrollContainerRef, isDragging, interactionProps } = useQuestionNavigationDragScroll();

    return (
        <aside className="border-border/60 bg-muted/10 hidden h-full w-[76px] shrink-0 border-r lg:block">
            <div
                ref={scrollContainerRef}
                className={cn(
                    'h-full overflow-y-auto overscroll-contain select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                    isDragging ? 'cursor-grabbing' : 'cursor-grab',
                )}
                {...interactionProps}
            >
                <div className="flex min-h-full flex-col items-stretch gap-1 px-0 py-3">
                    {questionRail}
                </div>
            </div>
        </aside>
    );
}
