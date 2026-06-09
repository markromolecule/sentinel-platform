'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnalyticsKPICards } from '@/app/(protected)/analytics/_components';
import { Skeleton, cn } from '@sentinel/ui';
import { AnalyticsPageShell } from './_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsKPIsQuery } from '@/data';
import { mapAnalyticsKPIs } from './_utils/map-analytics-kpis';
import { ShieldAlert, ClipboardList, Building2, FileBarChart } from 'lucide-react';

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
                'Review incident trends, severity mix, and common violation patterns across exams.',
            href: '/analytics/incidents',
            icon: ShieldAlert,
            iconColor: 'text-red-600',
            iconBg: 'bg-red-500/10 border-red-500/20',
        },
        {
            title: 'Exam Performance',
            description:
                'See completion volume, throughput, and drop-off trends in one place.',
            href: '/analytics/exams',
            icon: ClipboardList,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-500/10 border-emerald-500/20',
        },
        {
            title: 'Integrity by Department',
            description:
                'Compare department integrity rates and identify areas needing review.',
            href: '/analytics/integrity',
            icon: Building2,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-500/10 border-amber-500/20',
        },
        {
            title: 'Generated Reports',
            description:
                'Generate and download reports for audits, reviews, and record keeping.',
            href: '/analytics/reports',
            icon: FileBarChart,
            iconColor: 'text-violet-600',
            iconBg: 'bg-violet-500/10 border-violet-500/20',
        },
    ];

    return (
        <AnalyticsPageShell
            title="System Reports & Analytics"
            description="Real-time telemetry, session metrics, and integrity insights for the sentinel proctoring system."
        >
            <div className="flex flex-col gap-8">
                {/* Row 1: KPI Statistics Overview */}
                {isScopeLoading || isKpisLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-[124px] w-full rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <AnalyticsKPICards data={mappedKPIs} />
                )}

                {/* Row 2: Premium Quick Link Cards */}
                <div className="flex flex-col gap-5">
                    <div className="flex max-w-2xl flex-col gap-2">
                        <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                            Analytics Telemetry Domains
                        </h2>
                        <p className="text-muted-foreground text-sm leading-6">
                            Choose a domain to open focused analytics, supporting charts, and
                            report views.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {QUICK_LINKS.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'flex h-full min-h-[210px] flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-border hover:bg-muted/30 md:p-6',
                                    )}
                                >
                                    <div className="space-y-4">
                                        <div
                                            className={cn(
                                                'inline-flex h-11 w-11 items-center justify-center rounded-xl border',
                                                link.iconColor,
                                                link.iconBg,
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-foreground text-base font-semibold tracking-tight">
                                                {link.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-6">
                                                {link.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-[#323d8f]">
                                        Open section
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
