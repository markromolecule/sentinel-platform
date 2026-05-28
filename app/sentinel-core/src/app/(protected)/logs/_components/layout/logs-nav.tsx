import Link from 'next/link';
import { cn, Separator } from '@sentinel/ui';
import { ShieldCheck, UserCog, Terminal, type LucideIcon } from 'lucide-react';

export type LogsSection = 'auth' | 'activity' | 'system';

interface LogsNavItem {
    id: LogsSection;
    label: string;
    href: string;
    icon: LucideIcon;
    iconColor: string;
}

const LOGS_NAV_GROUPS = [
    {
        title: 'System Activity',
        items: [
            { id: 'auth', label: 'Auth Logs', href: '/logs/auth', icon: ShieldCheck, iconColor: 'text-emerald-500' },
            { id: 'activity', label: 'Activity Logs', href: '/logs/activity', icon: UserCog, iconColor: 'text-blue-500' },
            { id: 'system', label: 'System Logs', href: '/logs/system', icon: Terminal, iconColor: 'text-indigo-500' },
        ] as LogsNavItem[],
    },
];

export type LogsNavProps = {
    activeSection: LogsSection;
};

/**
 * LogsNav renders the sidebar navigation links for the System Logs section.
 *
 * @param props - LogsNavProps containing activeSection
 */
export function LogsNav({ activeSection }: LogsNavProps) {
    return (
        <nav className="mt-1 flex flex-col gap-2">
            {LOGS_NAV_GROUPS.map((group, groupIndex) => (
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

