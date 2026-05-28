'use client';

import * as React from 'react';
import { AnalyticsReportsList } from '@/app/(protected)/analytics/_components';
import { Skeleton } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import {
    useAnalyticsReportsQuery,
    useGenerateAnalyticsReportMutation,
} from '@/data';

/**
 * ReportsAnalyticsPage displays historically generated analytical reports
 * and provides features to request new custom report generation.
 */
export default function ReportsAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    // Live backend queries with institution scoping
    const { data: reportsData, isLoading: isReportsLoading } = useAnalyticsReportsQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    // Report generation mutation
    const { mutate: generateReport } = useGenerateAnalyticsReportMutation();

    return (
        <AnalyticsPageShell
            title="Generated Reports"
            description="Manage, preview, and generate official institution proctoring reports for audits and compliance standards."
        >
            <div className="border-border/40 border-t pt-2">
                {isScopeLoading || isReportsLoading ? (
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                ) : (
                    <AnalyticsReportsList
                        reports={reportsData?.records || []}
                        onGenerateReport={generateReport}
                    />
                )}
            </div>
        </AnalyticsPageShell>
    );
}
