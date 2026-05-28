'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SubjectNav, type SubjectSection } from './subject-nav';
import { Separator } from '@sentinel/ui';

type SubjectWorkspaceShellProps = {
    children: ReactNode;
};

/**
 * SubjectWorkspaceShell renders the layout shell for the Subject Management section.
 * It includes a sticky sidebar navigation on desktop viewports and a card-style top navigation on mobile.
 *
 * @param props - SubjectWorkspaceShellProps containing children ReactNode
 */
export function SubjectWorkspaceShell({ children }: SubjectWorkspaceShellProps) {
    const pathname = usePathname() || '';

    // Derive active section based on the current pathname
    let activeSection: SubjectSection = 'list';
    if (pathname.startsWith('/subjects/classifications')) {
        activeSection = 'classifications';
    } else if (pathname.startsWith('/subjects/offered')) {
        activeSection = 'offered';
    } else if (pathname.startsWith('/subjects/requests')) {
        activeSection = 'requests';
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            {/* Desktop Sidebar */}
            <div className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Subject Management
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <SubjectNav activeSection={activeSection} />
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <SubjectNav activeSection={activeSection} />
                </div>
            </div>

            {/* Main Content */}
            <main className="min-w-0 flex-1 space-y-8 p-6 pb-10">{children}</main>
        </div>
    );
}
