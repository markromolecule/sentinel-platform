import { type ReactNode } from 'react';
import { AccessControlNav, type AccessControlSection } from './access-control-nav';
import { Separator } from '@sentinel/ui';
type AccessControlWorkspaceShellProps = {
    activeSection: string;
    onActiveSectionChange: (id: AccessControlSection) => void;
    children: ReactNode;
};

export function AccessControlWorkspaceShell({
    activeSection,
    onActiveSectionChange,
    children
}: AccessControlWorkspaceShellProps) {
    return (
        <div className="relative flex flex-col lg:flex-row lg:items-stretch lg:-m-6 min-h-[calc(100vh-64px)]">
            <div className="sticky -top-6 hidden lg:flex flex-col w-64 shrink-0 border-r bg-background">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h1 className="text-[1.1rem] font-bold tracking-tight text-foreground">
                        Access Control
                    </h1>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <div className="flex-1 overflow-y-auto py-3">
                    <AccessControlNav
                        activeSection={activeSection}
                        onActiveSectionChange={onActiveSectionChange}
                    />
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="lg:hidden px-4 pt-6">
                <div className="rounded-xl border bg-card/20 p-1.5 backdrop-blur-sm shadow-sm">
                    <AccessControlNav
                        activeSection={activeSection}
                        onActiveSectionChange={onActiveSectionChange}
                    />
                </div>
            </div>

            <main className="min-w-0 flex-1 p-6 space-y-8 pb-10">
                {children}
            </main>
        </div>
    );
}
