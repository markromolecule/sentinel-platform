'use client';

import { ExamCompletionChart } from '@/app/(protected)/analytics/_components';
import { Skeleton } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsExamCompletionsQuery } from '@/data';

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

    return (
        <AnalyticsPageShell
            title="Exam Performance"
            description="Track exam completion volume, total active tests, average duration, and computed academic integrity compliance indexes."
        >
            <div className="flex flex-col gap-6">
                {isLoading ? (
                    <Skeleton className="h-[420px] w-full rounded-xl" />
                ) : (
                    <ExamCompletionChart
                        data={(examCompletionsData as unknown as Record<string, unknown>[]) || []}
                    />
                )}
            </div>
        </AnalyticsPageShell>
    );
}
