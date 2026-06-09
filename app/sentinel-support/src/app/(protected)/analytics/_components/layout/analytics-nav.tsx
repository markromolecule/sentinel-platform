import Link from 'next/link';
import { cn, Separator } from '@sentinel/ui';

export type AnalyticsSection = 'overview' | 'incidents' | 'exams' | 'integrity' | 'reports';

interface AnalyticsNavItem {
    id: AnalyticsSection;
    label: string;
    href: string;
}

const ANALYTICS_NAV_GROUPS = [
    {
        title: 'Telemetry',
        items: [
            {
                id: 'overview',
                label: 'Overview',
                href: '/analytics',
            },
            {
                id: 'incidents',
                label: 'Incidents',
                href: '/analytics/incidents',
            },
            {
                id: 'exams',
                label: 'Exams',
                href: '/analytics/exams',
            },
            {
                id: 'integrity',
                label: 'Integrity',
                href: '/analytics/integrity',
            },
        ] as AnalyticsNavItem[],
    },
    {
        title: 'Reports',
        items: [
            {
                id: 'reports',
                label: 'Reports',
                href: '/analytics/reports',
            },
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
        <nav className="mt-0.5 flex flex-col gap-1.5">
            {ANALYTICS_NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="flex flex-col">
                    {groupIndex > 0 && <Separator className="bg-border/40 my-2.5" />}

                    <h3 className="text-muted-foreground/60 mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                        {group.title}
                    </h3>

                    <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const isActive = activeSection === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center px-3 py-2 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-accent/50 border-r-2 border-[#323d8f] font-semibold text-[#323d8f]'
                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                    )}
                                >
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
