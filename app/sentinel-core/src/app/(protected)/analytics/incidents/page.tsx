'use client';

import * as React from 'react';
import {
    IncidentTrendsChart,
    IncidentByTypeChart,
    IncidentSeverityChart,
} from '@/app/(protected)/analytics/_components';
import { Skeleton } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import {
    useAnalyticsIncidentSeverityQuery,
    useAnalyticsIncidentTypeQuery,
    useAnalyticsIncidentTrendsQuery,
} from '@/data';

/**
 * IncidentsAnalyticsPage displays visual analytics specifically related to proctoring incidents,
 * violations severity, and category distribution.
 */
export default function IncidentsAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    // Live backend queries with institution scoping
    const { data: severityData, isLoading: isSeverityLoading } = useAnalyticsIncidentSeverityQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const { data: typeData, isLoading: isTypeLoading } = useAnalyticsIncidentTypeQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const { data: incidentTrendsData, isLoading: isIncidentTrendsLoading } =
        useAnalyticsIncidentTrendsQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    return (
        <AnalyticsPageShell
            title="Incident Analytics"
            description="Visualize, track, and filter exam security violations, severity trends, and specific infraction category types."
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Trends chart */}
                <div className="lg:col-span-4">
                    {isScopeLoading || isIncidentTrendsLoading ? (
                        <Skeleton className="h-[380px] w-full rounded-xl" />
                    ) : (
                        <IncidentTrendsChart
                            data={(incidentTrendsData as unknown as Record<string, unknown>[]) || []}
                        />
                    )}
                </div>

                {/* Severity distribution chart */}
                <div className="lg:col-span-2">
                    {isScopeLoading || isSeverityLoading ? (
                        <Skeleton className="h-[380px] w-full rounded-xl" />
                    ) : (
                        <IncidentSeverityChart data={severityData || []} />
                    )}
                </div>

                {/* Category breakdown chart */}
                <div className="lg:col-span-2">
                    {isScopeLoading || isTypeLoading ? (
                        <Skeleton className="h-[380px] w-full rounded-xl" />
                    ) : (
                        <IncidentByTypeChart data={typeData || []} />
                    )}
                </div>
            </div>
        </AnalyticsPageShell>
    );
}
