'use client';

import Link from 'next/link';
import { Database, ClipboardCheck, ShieldAlert, MessageSquare } from 'lucide-react';

/**
 * Renders the Quick Access navigation grid with premium, card-free, and borderless link panels.
 *
 * @returns React component for quick access links
 */
export function QuickAccess() {
    const actions = [
        {
            title: 'Question Bank',
            description: 'Manage and search items',
            href: '/question/bank',
            icon: Database,
            color: 'text-[#323d8f]',
            hoverBg: 'hover:bg-[#323d8f]/5',
        },
        {
            title: 'Grading',
            description: 'Review and score student exams',
            href: '/exams/grading',
            icon: ClipboardCheck,
            color: 'text-emerald-600',
            hoverBg: 'hover:bg-emerald-50',
        },
        {
            title: 'Incident Logs',
            description: 'Review proctoring integrity flags',
            href: '/exams/logs',
            icon: ShieldAlert,
            color: 'text-rose-600',
            hoverBg: 'hover:bg-rose-50',
        },
        {
            title: 'Messages',
            description: 'Connect with students and proctors',
            href: '/messages',
            icon: MessageSquare,
            color: 'text-amber-600',
            hoverBg: 'hover:bg-amber-50',
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">Quick Access</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.title}
                            href={action.href}
                            className={`border-border/40 bg-background/50 flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 ${action.hoverBg} hover:border-border/80 hover:scale-[1.01]`}
                        >
                            <div
                                className={`bg-background border-border/20 rounded-xl border p-3 shadow-sm ${action.color}`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-foreground text-sm font-medium tracking-tight">
                                    {action.title}
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                    {action.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
