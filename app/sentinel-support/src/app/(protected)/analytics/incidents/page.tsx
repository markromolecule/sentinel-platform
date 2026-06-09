'use client';

import * as React from 'react';
import { Skeleton } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsIncidentTypeQuery } from '@/data';
import { IncidentAnalyticsOverview } from './_components/incident-analytics-overview';

/**
 * IncidentsAnalyticsPage presents a clear system-wide view of proctoring incidents,
 * combining type breakdowns and concise summary metrics in one dashboard.
 */
export default function IncidentsAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    const { data: typeData, isLoading: isTypeLoading } = useAnalyticsIncidentTypeQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const isLoading = isScopeLoading || isTypeLoading;

    return (
        <AnalyticsPageShell
            title="Incident Analytics"
            description="System-wide incident patterns and detailed breakdowns for review."
        >
            {isLoading ? (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[...Array(4)].map((_, index) => (
                            <Skeleton key={index} className="h-[140px] w-full rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-[360px] w-full rounded-2xl" />
                </div>
            ) : (
                <IncidentAnalyticsOverview typeData={typeData ?? []} />
            )}
        </AnalyticsPageShell>
    );
}
