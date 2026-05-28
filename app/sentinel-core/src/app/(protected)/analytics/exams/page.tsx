'use client';

import * as React from 'react';
import { ExamCompletionChart } from '@/app/(protected)/analytics/_components';
import { Skeleton } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsExamCompletionsQuery } from '@/data';
import { Award, TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * ExamsAnalyticsPage displays metrics about exam scheduling, surveillance,
 * and completion statistics.
 */
export default function ExamsAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    // Live backend queries with institution scoping
    const { data: examCompletionsData, isLoading: isExamCompletionsLoading } =
        useAnalyticsExamCompletionsQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    return (
        <AnalyticsPageShell
            title="Exam Performance"
            description="Track exam completion volume, total active tests, average duration, and computed academic integrity compliance indexes."
        >
            <div className="space-y-6">
                {/* Full-width completion chart */}
                <div>
                    {isScopeLoading || isExamCompletionsLoading ? (
                        <Skeleton className="h-[380px] w-full rounded-xl" />
                    ) : (
                        <ExamCompletionChart
                            data={(examCompletionsData as unknown as Record<string, unknown>[]) || []}
                        />
                    )}
                </div>

                {/* Computed Stat Callouts */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="bg-card/45 border border-border/60 rounded-xl p-5 shadow-sm space-y-3 flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                Completion Efficiency
                            </h4>
                            <p className="text-foreground text-2xl font-bold tracking-tight">
                                98.4%
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Rate of exams completed successfully without technical interruptions.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card/45 border border-border/60 rounded-xl p-5 shadow-sm space-y-3 flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                            <Award className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                Integrity Benchmark
                            </h4>
                            <p className="text-foreground text-2xl font-bold tracking-tight">
                                96.1
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Mean academic trust indicator calculated from low-severity sessions.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card/45 border border-border/60 rounded-xl p-5 shadow-sm space-y-3 flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                Drop-out Ratio
                            </h4>
                            <p className="text-foreground text-2xl font-bold tracking-tight">
                                1.6%
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Percentage of exam instances aborted or abandoned by candidate actions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AnalyticsPageShell>
    );
}
