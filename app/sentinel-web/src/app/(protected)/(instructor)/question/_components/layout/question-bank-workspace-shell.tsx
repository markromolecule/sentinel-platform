'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Separator } from '@sentinel/ui';
import { QuestionBankNav } from './question-bank-nav';

type QuestionBankWorkspaceShellProps = {
    children: ReactNode;
};

/**
 * QuestionBankWorkspaceShell renders the local question-bank navigation shell.
 *
 * @param props - QuestionBankWorkspaceShellProps containing children ReactNode.
 */
export function QuestionBankWorkspaceShell({ children }: QuestionBankWorkspaceShellProps) {
    const pathname = usePathname() || '';

    if (!pathname.startsWith('/question')) {
        return <>{children}</>;
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            <div className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Question Bank
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <QuestionBankNav />
                </div>
            </div>

            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <QuestionBankNav />
                </div>
            </div>

            <main className="min-w-0 flex-1">{children}</main>
        </div>
    );
}
