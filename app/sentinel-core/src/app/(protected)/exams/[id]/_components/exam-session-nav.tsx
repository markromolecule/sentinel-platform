'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@sentinel/ui';

type ExamSessionSection = 'lobby' | 'monitoring' | 'report' | 'queue' | 'logs';

type ExamSessionNavItem = {
    id: ExamSessionSection;
    label: string;
    href: string;
};

type ExamSessionNavProps = {
    examId: string;
};

function resolveActiveSection(
    pathname: string,
    searchParams: URLSearchParams | ReturnType<typeof useSearchParams>,
): ExamSessionSection | null {
    const parts = pathname.split('/').filter(Boolean);
    const section = parts[2];
    const reportSection = searchParams.get('section');

    if (parts[0] !== 'exams' || !parts[1]) {
        return null;
    }

    if (section === 'lobby') {
        return 'lobby';
    }

    if (section === 'monitoring') {
        return 'monitoring';
    }

    if (section === 'report') {
        return reportSection === 'queue' ? 'queue' : 'report';
    }

    if (section === 'logs') {
        return 'logs';
    }

    return null;
}

/**
 * ExamSessionNav renders local Lobby and Monitoring navigation for one exam runtime.
 *
 * @param props - ExamSessionNavProps containing the current examId.
 */
export function ExamSessionNav({ examId }: ExamSessionNavProps) {
    const pathname = usePathname() || '';
    const searchParams = useSearchParams();
    const activeSection = resolveActiveSection(pathname, searchParams);
    const items: ExamSessionNavItem[] = [
        {
            id: 'lobby',
            label: 'Lobby',
            href: `/exams/${examId}/lobby`,
        },
        {
            id: 'monitoring',
            label: 'Monitoring',
            href: `/exams/${examId}/monitoring`,
        },
        {
            id: 'report',
            label: 'Attempt Summary',
            href: `/exams/${examId}/report`,
        },
        {
            id: 'queue',
            label: 'Action Queue',
            href: `/exams/${examId}/report?section=queue`,
        },
        {
            id: 'logs',
            label: 'Incident Logs',
            href: `/exams/${examId}/logs`,
        },
    ];

    return (
        <nav className="mt-1 flex flex-col gap-1">
            <h3 className="text-muted-foreground/60 mb-2 px-4 text-xs font-semibold tracking-wider uppercase">
                Runtime
            </h3>

            {items.map((item) => {
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
                        <span className="truncate">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
