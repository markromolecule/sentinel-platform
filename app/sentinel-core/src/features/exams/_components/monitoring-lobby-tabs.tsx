'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@sentinel/ui';

type MonitoringLobbyTabsProps = {
    examId: string;
    className?: string;
};

export function MonitoringLobbyTabs({ examId, className }: MonitoringLobbyTabsProps) {
    const pathname = usePathname();

    const isLobby = pathname.includes('/lobby');
    const isMonitoring = pathname.includes('/monitoring');

    const tabs = [
        {
            label: 'Lobby',
            href: `/exams/${examId}/lobby`,
            active: isLobby,
        },
        {
            label: 'Monitoring',
            href: `/exams/${examId}/monitoring`,
            active: isMonitoring,
        },
    ];

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                        'rounded-md px-4 py-2 text-sm font-bold transition-all',
                        tab.active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
