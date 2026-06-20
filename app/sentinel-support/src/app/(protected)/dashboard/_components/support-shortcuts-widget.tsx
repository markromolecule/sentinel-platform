'use client';

import Link from 'next/link';
import {
    Activity,
    ArrowRight,
    FileText,
    Megaphone,
    MessageSquare,
    School2,
    Users,
} from 'lucide-react';

interface ShortcutItem {
    title: string;
    description: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
}

const SHORTCUTS: ShortcutItem[] = [
    {
        title: 'Institutions',
        description: 'Manage institutional configurations and access keys.',
        url: '/institutions',
        icon: School2,
        colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
        title: 'Identity & Access',
        description: 'Manage users, roles, and administrative permissions.',
        url: '/users',
        icon: Users,
        colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
        title: 'Telemetry Monitor',
        description: 'Track real-time system performance and incoming metrics.',
        url: '/telemetry',
        icon: Activity,
        colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
        title: 'System Logs',
        description: 'Audit operations and investigate exceptions/events.',
        url: '/logs',
        icon: FileText,
        colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
        title: 'Announcements',
        description: 'Broadcast system updates and support alerts to users.',
        url: '/announcements',
        icon: Megaphone,
        colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
        title: 'Messages',
        description: 'Communicate directly with users regarding issues.',
        url: '/messages',
        icon: MessageSquare,
        colorClass: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400',
    },
];

/**
 * SupportShortcutsWidget renders a grid of direct navigation shortcuts
 * to the most common actions and management dashboards for support staff.
 * It is fully borderless, card-free, and features subtle micro-animations.
 */
export function SupportShortcutsWidget() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    Quick Access
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Shortcut to primary management utilities.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SHORTCUTS.map((shortcut) => {
                    const Icon = shortcut.icon;
                    return (
                        <Link
                            key={shortcut.title}
                            href={shortcut.url}
                            className="group flex items-start gap-4 rounded-2xl border border-slate-100/80 bg-slate-50/50 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200/60 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900/30 dark:hover:border-slate-700/60 dark:hover:bg-slate-900/50"
                        >
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${shortcut.colorClass} shadow-xs`}
                            >
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="group-hover:text-primary text-sm font-semibold text-slate-800 transition-colors dark:text-slate-200">
                                        {shortcut.title}
                                    </h4>
                                    <ArrowRight className="text-primary h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                                </div>
                                <p className="mt-1 text-xs leading-normal text-slate-500 dark:text-slate-400">
                                    {shortcut.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
