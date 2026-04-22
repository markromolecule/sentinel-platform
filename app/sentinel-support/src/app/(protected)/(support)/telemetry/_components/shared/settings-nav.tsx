'use client';

import { cn } from '@sentinel/ui';
import { Activity, Beaker, Cpu, ShieldAlert } from 'lucide-react';

const SECTIONS = [
    { id: 'operations', label: 'Operations', icon: Activity },
    { id: 'rules', label: 'Rule Overrides', icon: ShieldAlert },
    { id: 'sandbox', label: 'MediaPipe Sandbox', icon: Beaker },
    { id: 'health', label: 'System Health', icon: Cpu },
];

export type SettingsNavProps = {
    activeSection: string;
    onActiveSectionChange: (id: string) => void;
};

export function SettingsNav({ activeSection, onActiveSectionChange }: SettingsNavProps) {
    return (
        <nav className="sticky top-24 hidden w-64 shrink-0 flex-col gap-1 lg:flex">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                    <button
                        key={section.id}
                        onClick={() => onActiveSectionChange(section.id)}
                        className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                            isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        <Icon className={cn(
                            'size-4 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )} />
                        {section.label}
                    </button>
                );
            })}
        </nav>
    );
}
