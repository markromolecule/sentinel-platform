'use client';

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
    return (
        <div className="bg-background flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <ExamAttemptShellHeader
                title={title}
                timerLabel={timerLabel}
                status={status}
                toolbar={toolbar}
            />
            <ExamAttemptWorkspace
                questionRail={questionRail}
                passagePanel={passagePanel}
                footer={footer}
            >
                {children}
            </ExamAttemptWorkspace>
        </div>
    );
}
