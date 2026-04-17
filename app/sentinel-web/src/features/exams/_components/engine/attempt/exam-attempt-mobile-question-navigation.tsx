'use client';

import type { ReactNode } from 'react';
import { ScrollArea } from '@sentinel/ui';

type ExamAttemptMobileQuestionNavigationProps = {
    questionRail: ReactNode;
};

export function ExamAttemptMobileQuestionNavigation({
    questionRail,
}: ExamAttemptMobileQuestionNavigationProps) {
    return (
        <div className="border-border/60 bg-muted/10 border-b px-3 py-3 lg:hidden">
            <ScrollArea className="w-full whitespace-nowrap" type="always">
                <div className="flex items-center gap-2 pr-3">{questionRail}</div>
            </ScrollArea>
        </div>
    );
}
