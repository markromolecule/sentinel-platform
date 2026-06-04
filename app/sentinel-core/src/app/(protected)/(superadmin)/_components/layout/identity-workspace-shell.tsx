'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { IdentityNav, type IdentitySection } from './identity-nav';
import { Separator } from '@sentinel/ui';
import type { CoreRole } from '@/lib/auth/core-role';

type IdentityWorkspaceShellProps = {
    children: ReactNode;
    role?: CoreRole;
};

/**
 * IdentityWorkspaceShell renders the layout shell for the Identity & Access management section.
 * It includes a sticky sidebar navigation on desktop viewports and a card-style top navigation on mobile.
 *
 * @param props - IdentityWorkspaceShellProps containing children ReactNode and optional user role
 */
export function IdentityWorkspaceShell({ children, role }: IdentityWorkspaceShellProps) {
    const pathname = usePathname() || '';

    // Derive active section based on the current pathname and role
    let activeSection: IdentitySection = 'administrators';
    if (pathname.startsWith('/administrators/students')) {
        activeSection = 'students';
    } else if (pathname.startsWith('/administrators/instructors')) {
        activeSection = 'instructors';
    } else if (pathname.startsWith('/administrators/whitelist')) {
        activeSection = role === 'admin' ? 'student-whitelist' : 'whitelist';
    } else if (pathname.startsWith('/permissions')) {
        activeSection = 'permissions';
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            {/* Desktop Sidebar */}
            <div className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Identity & Access
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <IdentityNav activeSection={activeSection} role={role} />
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <IdentityNav activeSection={activeSection} role={role} />
                </div>
            </div>

            {/* Main Content */}
            <main className="min-w-0 flex-1 space-y-8 p-6 pb-10">{children}</main>
        </div>
    );
}
