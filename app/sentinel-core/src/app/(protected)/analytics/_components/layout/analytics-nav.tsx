import Link from 'next/link';
import { cn, Separator } from '@sentinel/ui';
import { LayoutDashboard, ShieldAlert, ClipboardList, Building2, FileBarChart, type LucideIcon } from 'lucide-react';

export type AnalyticsSection = 'overview' | 'incidents' | 'exams' | 'integrity' | 'reports';

interface AnalyticsNavItem {
    id: AnalyticsSection;
    label: string;
    href: string;
    icon: LucideIcon;
    iconColor: string;
}

const ANALYTICS_NAV_GROUPS = [
    {
        title: 'Telemetry',
        items: [
            { id: 'overview', label: 'Overview', href: '/analytics', icon: LayoutDashboard, iconColor: 'text-sky-500' },
            { id: 'incidents', label: 'Incidents', href: '/analytics/incidents', icon: ShieldAlert, iconColor: 'text-red-500' },
            { id: 'exams', label: 'Exams', href: '/analytics/exams', icon: ClipboardList, iconColor: 'text-emerald-500' },
            { id: 'integrity', label: 'Integrity', href: '/analytics/integrity', icon: Building2, iconColor: 'text-amber-500' },
        ] as AnalyticsNavItem[],
    },
    {
        title: 'Reports',
        items: [
            { id: 'reports', label: 'Reports', href: '/analytics/reports', icon: FileBarChart, iconColor: 'text-violet-500' },
        ] as AnalyticsNavItem[],
    },
];

export type AnalyticsNavProps = {
    activeSection: AnalyticsSection;
};

/**
 * AnalyticsNav renders the sidebar navigation links for the Analytics section.
 *
 * @param props - AnalyticsNavProps containing activeSection
 */
export function AnalyticsNav({ activeSection }: AnalyticsNavProps) {
    return (
        <nav className="mt-1 flex flex-col gap-2">
            {ANALYTICS_NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="flex flex-col">
                    {groupIndex > 0 && <Separator className="bg-border/40 my-3" />}

                    <h3 className="text-muted-foreground/60 mb-2 px-4 text-xs font-semibold tracking-wider uppercase">
                        {group.title}
                    </h3>

                    <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const isActive = activeSection === item.id;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-accent/50 border-r-2 border-[#323d8f] font-semibold text-[#323d8f]'
                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                    )}
                                >
                                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? item.iconColor : 'text-muted-foreground/60 group-hover:text-foreground')} />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}

