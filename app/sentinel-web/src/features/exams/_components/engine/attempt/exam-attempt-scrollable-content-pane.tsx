'use client';

import type { ReactNode } from 'react';
import { ScrollArea, cn } from '@sentinel/ui';

type ExamAttemptScrollableContentPaneProps = {
    children: ReactNode;
    paddingClassName: string;
    hasFooter: boolean;
};

export function ExamAttemptScrollableContentPane({
    children,
    paddingClassName,
    hasFooter,
}: ExamAttemptScrollableContentPaneProps) {
    return (
        <ScrollArea className="h-full w-full" type="always">
            <div className={cn('min-w-0', paddingClassName, hasFooter ? 'pb-4' : 'pb-8')}>
                {children}
            </div>
        </ScrollArea>
    );
}
