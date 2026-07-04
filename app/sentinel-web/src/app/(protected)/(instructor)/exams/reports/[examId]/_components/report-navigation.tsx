import * as React from 'react';
import { cn, Separator } from '@sentinel/ui';
import type { ExamReportSection } from '../_types';

interface ReportNavigationProps {
    activeSection: ExamReportSection;
    setActiveSection: (section: ExamReportSection) => void;
}

/**
 * Component managing the side navigation on desktop and top-tabs navigation on mobile
 * for the detailed exam report sections.
 */
export function ReportNavigation({ activeSection, setActiveSection }: ReportNavigationProps) {
    const sections: { id: ExamReportSection; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'attempts', label: 'Attempt Summary' },
        { id: 'queue', label: 'Action Queue' },
        { id: 'logs', label: 'Incident Logs' },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h2 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Report Sections
                    </h2>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <nav className="mt-1 flex-1 flex-col gap-2 py-3">
                    <div className="flex flex-col gap-0.5">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    'group flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                    activeSection === section.id
                                        ? 'bg-accent/50 border-r-2 border-[#323d8f] font-semibold text-[#323d8f]'
                                        : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                )}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                </nav>
            </aside>

            {/* Mobile Navigation */}
            <div className="hidden px-4 pt-6">
                <div className="bg-card/20 flex gap-2 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors',
                                activeSection === section.id
                                    ? 'bg-background text-[#323d8f] shadow'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
