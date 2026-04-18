'use client';

import { LucideIcon } from 'lucide-react';
import type { PermissionState } from '../../_hooks/use-checkup-manager';

interface CheckStatusItem {
    label: string;
    description: string;
    state: PermissionState | 'granted' | 'idle';
    icon: LucideIcon;
}

interface CheckupStatusCardProps {
    checks: readonly CheckStatusItem[];
}

export function CheckupStatusCard({ checks }: CheckupStatusCardProps) {
    return (
        <div className="space-y-3">
            <h2 className="text-base font-semibold sm:text-lg">Check status</h2>

            <div className="space-y-3">
                {checks.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <item.icon className="text-primary h-4 w-4" />
                            <p className="text-sm font-semibold">{item.label}</p>
                        </div>
                        <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                            {item.description}
                        </p>
                        <p className="text-sm font-medium">
                            {item.state === 'granted'
                                ? 'Ready'
                                : item.state === 'blocked'
                                  ? 'Blocked'
                                  : 'Pending'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
