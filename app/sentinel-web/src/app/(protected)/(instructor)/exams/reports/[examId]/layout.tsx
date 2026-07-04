'use client';

import type { ReactNode } from 'react';
import { ExamSessionWorkspaceShell } from '../../[id]/_components/exam-session-workspace-shell';

type ExamReportLayoutProps = {
    children: ReactNode;
};

/**
 * ExamReportLayout wraps dynamic exam report routes with the runtime session shell.
 * This ensures the Lobby/Monitoring/Report/Logs sidebar remains visible on report pages.
 */
export default function ExamReportLayout({ children }: ExamReportLayoutProps) {
    return <ExamSessionWorkspaceShell>{children}</ExamSessionWorkspaceShell>;
}
