'use client';

import type { ReactNode } from 'react';
import { Separator } from '@sentinel/ui';

type ExamBuilderWorkspaceShellProps = {
    sidebar: ReactNode;
    children: ReactNode;
};

/**
 * ExamBuilderWorkspaceShell renders the exam builder workspace in a persistent shell layout.
 * The sidebar is pinned on desktop and surfaced as a compact panel on mobile.
 *
 * @param props - ExamBuilderWorkspaceShellProps containing sidebar and children content.
 */
export function ExamBuilderWorkspaceShell({
    sidebar,
    children,
}: ExamBuilderWorkspaceShellProps) {
    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            <aside className="bg-background sticky -top-6 hidden w-80 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Exam Builder
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>
            </aside>

            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-3 shadow-sm backdrop-blur-sm">
                    {sidebar}
                </div>
            </div>

            <main className="min-w-0 flex-1 space-y-8 p-6 pb-10">{children}</main>
        </div>
    );
}
