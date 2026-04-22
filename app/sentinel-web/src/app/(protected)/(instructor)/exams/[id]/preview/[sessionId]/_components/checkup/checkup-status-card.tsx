'use client';

import { LucideIcon } from 'lucide-react';
import { Badge } from '@sentinel/ui';
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
        <div className="space-y-4">
            {checks.map((item) => (
                <div 
                    key={item.label} 
                    className="group relative flex flex-col gap-2 rounded-xl border border-border/40 bg-background/50 p-4 transition-all hover:border-border/80 hover:bg-background shadow-sm"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                <item.icon className="h-4.5 w-4.5" />
                            </div>
                            <p className="text-sm font-semibold">{item.label}</p>
                        </div>
                        
                        <Badge 
                            variant={
                                item.state === 'granted' 
                                    ? 'secondary' 
                                    : item.state === 'blocked' 
                                        ? 'destructive' 
                                        : 'outline'
                            }
                            className="h-5.5 px-2.5 text-[10px] font-bold uppercase tracking-wider"
                        >
                            {item.state === 'granted'
                                ? 'Ready'
                                : item.state === 'blocked'
                                  ? 'Blocked'
                                  : 'Pending'}
                        </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-xs leading-5">
                        {item.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
