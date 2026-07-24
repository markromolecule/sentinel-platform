'use client';

import type { ReactNode } from 'react';

type ExamAttemptMobileQuestionNavigationProps = {
    questionRail: ReactNode;
};

export function ExamAttemptMobileQuestionNavigation({
    questionRail,
}: ExamAttemptMobileQuestionNavigationProps) {
    return (
        <div className="border-border/60 bg-muted/10 border-b px-3 py-3 lg:hidden">
            <nav
                aria-label="Question navigation"
                className="w-full touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                data-testid="compact-question-navigation"
            >
                <div className="flex w-max min-w-full items-center gap-2 pr-3">{questionRail}</div>
            </nav>
        </div>
    );
}
