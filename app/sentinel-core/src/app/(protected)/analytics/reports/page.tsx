'use client';

import * as React from 'react';
import { AnalyticsReportsList } from '@/app/(protected)/analytics/_components';
import { Button, Skeleton } from '@sentinel/ui';
import { FileBarChart } from 'lucide-react';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsReportsQuery, useGenerateAnalyticsReportMutation } from '@/data';

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
            actions={
                <Button
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    onClick={() =>
                        generateReport({
                            title: `Administrative Telemetry Report - ${new Date().toLocaleDateString()}`,
                            type: 'incident',
                            format: 'pdf',
                        })
                    }
                >
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Generate New Report
                </Button>
            }
        >
            {isScopeLoading || isReportsLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
            ) : (
                <AnalyticsReportsList reports={reportsData?.records || []} />
            )}
        </AnalyticsPageShell>
    );
}
