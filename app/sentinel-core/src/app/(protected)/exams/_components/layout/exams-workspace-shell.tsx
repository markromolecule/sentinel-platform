'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Separator } from '@sentinel/ui';
import { ExamsNav, type ExamSection } from './exams-nav';

type ExamsWorkspaceShellProps = {
    children: ReactNode;
};

function getManagedSection(pathname: string): ExamSection | null {
    const parts = pathname.split('/').filter(Boolean);

    if (parts[0] !== 'exams') {
        return null;
    }

    if (parts.length === 1) {
        return 'dashboard';
    }

    const segment = parts[1];

    if (segment === 'assign') return 'assign';
    if (segment === 'grading') return 'grading';
    if (segment === 'logs') return 'logs';
    if (segment === 'dashboard' || segment === 'config') return 'dashboard';

    // Handle dynamic routes like /exams/[id]/assign, /exams/[id]/grading, etc.
    if (parts.length === 3) {
        const subsegment = parts[2];
        if (subsegment === 'assign') return 'assign';
        if (subsegment === 'grading') return 'grading';
    }

    return null;
}

/**
 * ExamsWorkspaceShell renders the exams-specific route shell with local navigation.
 *
 * @param props - ExamsWorkspaceShellProps containing children ReactNode.
 */
export function ExamsWorkspaceShell({ children }: ExamsWorkspaceShellProps) {
    const pathname = usePathname() || '';
    const activeSection = getManagedSection(pathname);

    if (!activeSection) {
        return <>{children}</>;
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            <div className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Exams
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <ExamsNav />
                </div>
            </div>

            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <ExamsNav />
                </div>
            </div>

            <main className="min-w-0 flex-1">{children}</main>
        </div>
    );
}
