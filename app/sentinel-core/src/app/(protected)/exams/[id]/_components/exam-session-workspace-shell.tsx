'use client';

import type { ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Separator } from '@sentinel/ui';
import { useExamQuery } from '@sentinel/hooks';
import { ExamSessionNav } from './exam-session-nav';

type ExamSessionWorkspaceShellProps = {
    children: ReactNode;
};

function isRuntimeRoute(pathname: string) {
    const parts = pathname.split('/').filter(Boolean);

    if (parts[0] !== 'exams' || !parts[1]) {
        return false;
    }

    return (
        parts[2] === 'lobby' ||
        parts[2] === 'monitoring' ||
        parts[2] === 'report' ||
        parts[2] === 'logs'
    );
}

/**
 * ExamSessionWorkspaceShell wraps exam Lobby and Monitoring routes with local runtime navigation.
 *
 * @param props - ExamSessionWorkspaceShellProps containing children ReactNode.
 */
export function ExamSessionWorkspaceShell({ children }: ExamSessionWorkspaceShellProps) {
    const pathname = usePathname() || '';
    const params = useParams<{ id?: string | string[] }>();
    const idParam = params.id;
    const examId = Array.isArray(idParam) ? idParam[0] : idParam;

    const { data: exam } = useExamQuery(examId);

    if (!isRuntimeRoute(pathname) || !examId) {
        return <>{children}</>;
    }

    const isReportPage = pathname.includes('/report');
    const isCompleted = exam?.status === 'completed' || exam?.status === 'archived';
    const showReportSectionSidebar = isReportPage && isCompleted;
    const sidebarTitle = showReportSectionSidebar ? 'Report Section' : 'Exam Session';

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            <aside className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        {sidebarTitle}
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <ExamSessionNav examId={examId} />
                </div>
            </aside>

            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <ExamSessionNav examId={examId} />
                </div>
            </div>

            <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
    );
}
