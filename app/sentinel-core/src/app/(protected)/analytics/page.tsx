'use client';

import * as React from 'react';
import {
    AnalyticsReportsList,
    ExamCompletionChart,
    IncidentTrendsChart,
    AnalyticsKPICards,
    IncidentByTypeChart,
    DepartmentIntegrityChart,
    IncidentSeverityChart,
} from '@/app/(protected)/analytics/_components';
import { PageHeader, Skeleton } from '@sentinel/ui';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import {
    useAnalyticsKPIsQuery,
    useAnalyticsIncidentSeverityQuery,
    useAnalyticsIncidentTypeQuery,
    useAnalyticsDepartmentIntegrityQuery,
    useAnalyticsReportsQuery,
    useGenerateAnalyticsReportMutation,
    useAnalyticsExamCompletionsQuery,
    useAnalyticsIncidentTrendsQuery,
} from '@/data';
import { mapAnalyticsKPIs } from './_utils/map-analytics-kpis';

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

    const { data: severityData, isLoading: isSeverityLoading } = useAnalyticsIncidentSeverityQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const { data: typeData, isLoading: isTypeLoading } = useAnalyticsIncidentTypeQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const { data: departmentData, isLoading: isDepartmentLoading } =
        useAnalyticsDepartmentIntegrityQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    const { data: reportsData, isLoading: isReportsLoading } = useAnalyticsReportsQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    // Report generation mutation
    const { mutate: generateReport } = useGenerateAnalyticsReportMutation();

    const { data: examCompletionsData, isLoading: isExamCompletionsLoading } =
        useAnalyticsExamCompletionsQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    const { data: incidentTrendsData, isLoading: isIncidentTrendsLoading } =
        useAnalyticsIncidentTrendsQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    const mappedKPIs = React.useMemo(() => {
        return mapAnalyticsKPIs(kpisSummary);
    }, [kpisSummary]);

    return (
        <div className="bg-background/50 flex min-h-screen flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="System Reports & Analytics"
                description="Real-time telemetry, session metrics, and integrity insights for the sentinel proctoring system."
            />

            {/* Row 1: KPI Statistics Overview */}
            {isScopeLoading || isKpisLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                    ))}
                </div>
            ) : (
                <AnalyticsKPICards data={mappedKPIs} />
            )}

            {/* Row 2 & 3: Unified Visual Data Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Completion & Volume Trends */}
                {isScopeLoading || isExamCompletionsLoading ? (
                    <Skeleton className="col-span-2 h-[380px] w-full rounded-xl" />
                ) : (
                    <ExamCompletionChart
                        data={(examCompletionsData as unknown as Record<string, unknown>[]) || []}
                    />
                )}

                {isScopeLoading || isIncidentTrendsLoading ? (
                    <Skeleton className="col-span-2 h-[380px] w-full rounded-xl" />
                ) : (
                    <IncidentTrendsChart
                        data={(incidentTrendsData as unknown as Record<string, unknown>[]) || []}
                    />
                )}

                {/* Outcomes Breakdown & Incident Telemetry */}
                {isScopeLoading || isDepartmentLoading ? (
                    <Skeleton className="col-span-2 h-[380px] w-full rounded-xl" />
                ) : (
                    <DepartmentIntegrityChart data={departmentData || []} />
                )}

                {isScopeLoading || isTypeLoading ? (
                    <Skeleton className="col-span-2 h-[380px] w-full rounded-xl" />
                ) : (
                    <IncidentByTypeChart data={typeData || []} />
                )}

                {isScopeLoading || isSeverityLoading ? (
                    <Skeleton className="col-span-1 h-[330px] w-full rounded-xl" />
                ) : (
                    <IncidentSeverityChart data={severityData || []} />
                )}
            </div>

            {/* Row 4: Historically Generated Printable Reports */}
            <div className="border-border/40 border-t pt-6">
                {isScopeLoading || isReportsLoading ? (
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                ) : (
                    <AnalyticsReportsList
                        reports={reportsData?.records || []}
                        onGenerateReport={generateReport}
                    />
                )}
            </div>
        </div>
    );
}
