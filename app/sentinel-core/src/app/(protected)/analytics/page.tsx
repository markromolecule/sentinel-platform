'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnalyticsKPICards } from '@/app/(protected)/analytics/_components';
import { Skeleton, cn } from '@sentinel/ui';
import { AnalyticsPageShell } from './_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsKPIsQuery } from '@/data';
import { mapAnalyticsKPIs } from './_utils/map-analytics-kpis';
import { ShieldAlert, ClipboardList, Building2, FileBarChart, ArrowRight } from 'lucide-react';

/**
 * AnalyticsPage is the orchestrator for the premium administration analytics panel,
 * displaying interactive charts, KPIs, and reports inside a responsive CSS grid layout.
 */
export default function AnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    // Live backend queries with institution scoping
    const { data: kpisSummary, isLoading: isKpisLoading } = useAnalyticsKPIsQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const mappedKPIs = React.useMemo(() => {
        return mapAnalyticsKPIs(kpisSummary);
    }, [kpisSummary]);

    const QUICK_LINKS = [
        {
            title: 'Incident Analytics',
            description:
                'Track and analyze student incident trends, severity distributions, and high-frequency violation types across all exams.',
            href: '/analytics/incidents',
            icon: ShieldAlert,
            iconColor: 'text-red-500 bg-red-500/10 border-red-500/20',
            hoverBorder: 'hover:border-red-500/30',
        },
        {
            title: 'Exam Performance',
            description:
                'Analyze real-time exam completion metrics, total volumes, and computed drop/completion rate trends.',
            href: '/analytics/exams',
            icon: ClipboardList,
            iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            hoverBorder: 'hover:border-emerald-500/30',
        },
        {
            title: 'Integrity by Department',
            description:
                'View structural department-level integrity ratings, comparison matrix tables, and academic unit compliance indexes.',
            href: '/analytics/integrity',
            icon: Building2,
            iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            hoverBorder: 'hover:border-amber-500/30',
        },
        {
            title: 'Generated Reports',
            description:
                'Generate, filter, and download printable analytical reports for administrative audits and institution records.',
            href: '/analytics/reports',
            icon: FileBarChart,
            iconColor: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
            hoverBorder: 'hover:border-violet-500/30',
        },
    ];

    return (
        <AnalyticsPageShell
            title="System Reports & Analytics"
            description="Real-time telemetry, session metrics, and integrity insights for the sentinel proctoring system."
        >
            <div className="flex flex-col gap-6">
                {/* Row 1: KPI Statistics Overview */}
                {isScopeLoading || isKpisLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <AnalyticsKPICards data={mappedKPIs} />
                )}

                {/* Row 2: Premium Quick Link Cards */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-foreground text-[1.25rem] font-bold tracking-tight">
                            Analytics Telemetry Domains
                        </h2>
                        <p className="text-muted-foreground max-w-2xl text-sm">
                            Select a domain below to explore deep analytics, visualize telemetry
                            charts, or export report spreadsheets.
                        </p>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {QUICK_LINKS.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'group bg-card/45 hover:bg-accent/30 border-border/60 flex cursor-pointer flex-col justify-between gap-5 rounded-2xl border p-6 shadow-sm transition-all duration-300',
                                        link.hoverBorder,
                                    )}
                                >
                                    <div className="space-y-4">
                                        <div
                                            className={cn(
                                                'inline-flex rounded-xl border p-3',
                                                link.iconColor,
                                            )}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-foreground text-lg font-bold tracking-tight transition-colors group-hover:text-[#323d8f]">
                                                {link.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {link.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#323d8f] group-hover:underline">
                                        <span>Explore Domain</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AnalyticsPageShell>
    );
}
