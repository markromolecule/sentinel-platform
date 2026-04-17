'use client';

import { useIsMobile } from '@sentinel/ui';

import type { ExamAttemptShellProps } from '../types';
import { ExamAttemptShellHeader } from './exam-attempt-shell-header';
import { ExamAttemptWorkspace } from './exam-attempt-workspace';

export function ExamAttemptShell({
    title,
    timerLabel,
    status,
    toolbar,
    questionRail,
    passagePanel,
    children,
    footer,
}: ExamAttemptShellProps) {
    const isMobile = useIsMobile();

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <ExamAttemptShellHeader
                title={title}
                timerLabel={timerLabel}
                status={status}
                toolbar={toolbar}
            />
            <ExamAttemptWorkspace
                isMobile={isMobile}
                questionRail={questionRail}
                passagePanel={passagePanel}
                footer={footer}
            >
                {children}
            </ExamAttemptWorkspace>
        </div>
    );
}
