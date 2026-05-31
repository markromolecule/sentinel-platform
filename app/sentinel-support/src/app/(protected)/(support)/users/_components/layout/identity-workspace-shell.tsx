import { type ReactNode } from 'react';
import { IdentityNav, type IdentitySection } from './identity-nav';
import { Separator } from '@sentinel/ui';

type IdentityWorkspaceShellProps = {
    activeSection: string;
    onActiveSectionChange: (id: IdentitySection) => void;
    children: ReactNode;
};

export function IdentityWorkspaceShell({
    activeSection,
    onActiveSectionChange,
    children,
}: IdentityWorkspaceShellProps) {
    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            <div className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Identity & Access
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <IdentityNav
                        activeSection={activeSection}
                        onActiveSectionChange={onActiveSectionChange}
                    />
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <IdentityNav
                        activeSection={activeSection}
                        onActiveSectionChange={onActiveSectionChange}
                    />
                </div>
            </div>

            <main className="min-w-0 flex-1 space-y-8 p-6 pb-10">{children}</main>
        </div>
    );
}
