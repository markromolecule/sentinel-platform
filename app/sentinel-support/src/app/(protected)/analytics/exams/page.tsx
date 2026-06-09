'use client';

import * as React from 'react';
import { ExamCompletionChart } from '@/app/(protected)/analytics/_components';
import { IncidentStatsCallout } from '@/app/(protected)/analytics/_components/incident-stats-callout';
import { Skeleton } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsExamCompletionsQuery } from '@/data';
import { Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { mapExamStats } from '../_utils/map-exam-stats';
import { ExamCompletionMetric } from '@sentinel/services';

/**
 * ExamsAnalyticsPage displays metrics about exam scheduling, surveillance,
 * and completion statistics. Stat callouts are computed from live API data.
 */
export default function ExamsAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    // Live backend queries with institution scoping
    const { data: examCompletionsData, isLoading: isExamCompletionsLoading } =
        useAnalyticsExamCompletionsQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    const isLoading = isScopeLoading || isExamCompletionsLoading;

    // Compute live stats from API data
    const examStats = React.useMemo(
        () => mapExamStats((examCompletionsData as ExamCompletionMetric[]) ?? []),
        [examCompletionsData],
    );

    return (
        <AnalyticsPageShell
            title="Exam Performance"
            description="Track exam completion volume, total active tests, average duration, and computed academic integrity compliance indexes."
        >
            <div className="flex flex-col gap-6">
                {/* Full-width completion chart */}
                <div>
                    {isLoading ? (
                        <Skeleton className="h-[380px] w-full rounded-xl" />
                    ) : (
                        <ExamCompletionChart
                            data={
                                (examCompletionsData as unknown as Record<string, unknown>[]) || []
                            }
                        />
                    )}
                </div>

                {/* Computed Stat Callouts — wired to live data */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                        </>
                    ) : (
                        <>
                            <IncidentStatsCallout
                                label="Completion Efficiency"
                                value={`${examStats.completionRate}%`}
                                description="Rate of exams completed successfully without technical interruptions."
                                icon={TrendingUp}
                                colorClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            />
                            <IncidentStatsCallout
                                label="Total Completed"
                                value={examStats.totalCompleted.toLocaleString()}
                                description={`Out of ${examStats.totalSessions.toLocaleString()} total monitored sessions.`}
                                icon={Award}
                                colorClass="bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                            />
                            <IncidentStatsCallout
                                label="Drop-out Ratio"
                                value={`${examStats.dropRate}%`}
                                description="Percentage of exam instances aborted or abandoned by candidate actions."
                                icon={AlertTriangle}
                                colorClass="bg-amber-500/10 text-amber-500 border-amber-500/20"
                            />
                        </>
                    )}
                </div>
            </div>
        </AnalyticsPageShell>
    );
}
