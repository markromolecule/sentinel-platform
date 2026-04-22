'use client';

import { cn } from '@sentinel/ui';
import { Activity, Key, Settings, Shield, UserPlus } from 'lucide-react';

export type AccessControlSection = 'overview' | 'roles' | 'permissions' | 'assignments' | 'examination-settings';

const ACCESS_CONTROL_NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'assignments', label: 'Assignments', icon: UserPlus },
    { id: 'examination-settings', label: 'Exam Settings', icon: Settings },
];

export type AccessControlNavProps = {
    activeSection: string;
    onActiveSectionChange: (id: AccessControlSection) => void;
};

export function AccessControlNav({ activeSection, onActiveSectionChange }: AccessControlNavProps) {
    return (
        <nav className="flex w-64 shrink-0 flex-col gap-1.5">
            {ACCESS_CONTROL_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onActiveSectionChange(item.id as AccessControlSection)}
                        className={cn(
                            'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 text-left',
                            isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                    >
                        <Icon className={cn(
                            'size-4.5 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/80'
                        )} />
                        <span>{item.label}</span>
                        {isActive && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
