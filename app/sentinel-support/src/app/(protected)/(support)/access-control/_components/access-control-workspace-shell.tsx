'use client';

import { type ReactNode } from 'react';
import { AccessControlNav, type AccessControlSection } from './access-control-nav';

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
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16 lg:px-8 lg:py-10">
            <div className="sticky top-28 hidden lg:block">
                <div className="mb-6 px-1">
                    <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground opacity-60">
                        Access Control
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-foreground/80">
                        Governance Portal
                    </p>
                </div>
                <AccessControlNav 
                    activeSection={activeSection} 
                    onActiveSectionChange={onActiveSectionChange} 
                />
            </div>

            {/* Mobile Nav */}
            <div className="lg:hidden">
                 <AccessControlNav 
                    activeSection={activeSection} 
                    onActiveSectionChange={onActiveSectionChange} 
                 />
            </div>

            <main className="min-w-0 flex-1 space-y-10 pb-20">
                {children}
            </main>
        </div>
    );
}
