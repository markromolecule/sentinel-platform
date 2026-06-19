'use client';

import Link from 'next/link';
import {
    ArrowRight,
    BarChart3,
    ClipboardCheck,
    Database,
    GraduationCap,
    MessageSquare,
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
        title: 'Exams Management',
        description: 'Schedule, configure, and monitor academic assessments.',
        url: '/exams',
        icon: GraduationCap,
        colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
        title: 'Question Bank',
        description: 'Manage institutional collections, categories, and question templates.',
        url: '/question',
        icon: Database,
        colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
        title: 'Enrollment Requests',
        description: 'Review and approve pending student enrollment requests.',
        url: '/subjects/requests',
        icon: ClipboardCheck,
        colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
        title: 'Insights',
        description: 'View integrity metrics, pass rates, and export system reports.',
        url: '/analytics',

        icon: BarChart3,
        colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
        title: 'Messages',
        description: 'Communicate directly with instructors and students.',
        url: '/messages',
        icon: MessageSquare,
        colorClass: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400',
    },
];

/**
 * AdminShortcutsWidget renders a grid of direct navigation shortcuts
 * to the most common actions and management dashboards for administrators and superadministrators.
 * It is fully borderless, card-free, and features subtle micro-animations.
 */
export function AdminShortcutsWidget() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    Quick Access
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Shortcut to primary administration utilities.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SHORTCUTS.map((shortcut) => {
                    const Icon = shortcut.icon;
                    return (
                        <Link
                            key={shortcut.title}
                            href={shortcut.url}
                            className="group flex items-start gap-4 rounded-2xl border border-slate-100/80 bg-slate-50/50 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200/60 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/30 dark:hover:border-slate-700/60 dark:hover:bg-slate-900/50 hover:shadow-sm"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${shortcut.colorClass} shadow-xs`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-primary dark:text-slate-200">
                                        {shortcut.title}
                                    </h4>
                                    <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                                </div>
                                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 leading-normal">
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
