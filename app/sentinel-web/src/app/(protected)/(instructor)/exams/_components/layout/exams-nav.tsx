'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, UserCheck, ClipboardCheck } from 'lucide-react';
import type { ElementType } from 'react';
import { cn, Separator } from '@sentinel/ui';

export type ExamSection = 'dashboard' | 'assign' | 'grading';

type ExamNavItem = {
    id: ExamSection;
    label: string;
    href: string;
    icon: ElementType;
};

const EXAM_NAV_GROUPS: Array<{ title: string; items: ExamNavItem[] }> = [
    {
        title: 'Exam Management',
        items: [
            { id: 'dashboard', label: 'Dashboard', href: '/exams', icon: LayoutDashboard },
            { id: 'assign', label: 'Assignments', href: '/exams?view=assign', icon: UserCheck },
            { id: 'grading', label: 'Grading', href: '/exams?view=grade', icon: ClipboardCheck },
        ],
    },
];

type SearchParamsLike = Pick<URLSearchParams, 'get'>;

function resolveActiveSection(pathname: string, searchParams: SearchParamsLike): ExamSection {
    if (pathname.startsWith('/exams/assign') || searchParams.get('view') === 'assign') {
        return 'assign';
    }

    if (pathname.startsWith('/exams/grading') || searchParams.get('view') === 'grade') {
        return 'grading';
    }

    return 'dashboard';
}

/**
 * ExamsNav renders the local exam navigation links for the instructor exams area.
 *
 * @returns JSX navigation links for exams routes.
 */
export function ExamsNav() {
    const pathname = usePathname() || '';
    const searchParams = useSearchParams();
    const activeSection = resolveActiveSection(pathname, searchParams);

    return (
        <nav className="mt-1 flex flex-col gap-2">
            {EXAM_NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="flex flex-col">
                    {groupIndex > 0 && <Separator className="bg-border/40 my-3" />}

                    <h3 className="text-muted-foreground/60 mb-2 px-4 text-xs font-semibold tracking-wider uppercase">
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
                                        'group flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-accent/50 border-r-2 border-[#323d8f] font-semibold text-[#323d8f]'
                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                    )}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
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
