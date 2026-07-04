'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, useAttemptReportQuery } from '@sentinel/hooks';
import { updateGradingAttempt } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { Button, Separator } from '@sentinel/ui';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AttemptReportView } from '@/features/exams/reports';

/**
 * Page component for instructor view of a single student's attempt report.
 * Provides custom sidebar layout, back navigation to attempts list, and inline overrides.
 */
export default function InstructorAttemptReportPage({
    params,
}: {
    params: Promise<{ examId: string; attemptId: string }>;
}) {
    const { examId, attemptId } = use(params);
    const apiClient = useApi();
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data, isLoading, isError } = useAttemptReportQuery(attemptId);
    const [optimisticScore, setOptimisticScore] = useState<number | null>(null);

    const calculateOptimisticScore = (itemOverrides: Record<string, any>) => {
        if (!data) return null;
        let score = 0;
        for (const report of data.attempt.questionReports) {
            const override = itemOverrides[report.questionId];
            if (override && typeof override.awardedScore === 'number') {
                score += override.awardedScore;
            } else {
                score += report.awardedScore ?? 0;
            }
        }
        return Math.round(score);
    };

    const saveMutation = useMutation({
        mutationFn: (payload: { itemOverrides: Record<string, any>; finalize: boolean }) =>
            updateGradingAttempt(apiClient, attemptId, {
                evaluations: data?.attempt.evaluations ?? {},
                feedback: data?.attempt.feedback !== null ? data?.attempt.feedback : undefined,
                itemOverrides: payload.itemOverrides,
                finalize: payload.finalize,
            }),
        onMutate: (variables) => {
            const optScore = calculateOptimisticScore(variables.itemOverrides);
            setOptimisticScore(optScore);
        },
        onSuccess: async (_, payload) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.attemptReport(attemptId),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.report(examId),
                }),
            ]);
            if (payload.finalize) {
                await queryClient.refetchQueries({
                    queryKey: EXAM_QUERY_KEYS.report(examId),
                });
            } else {
                await queryClient.refetchQueries({
                    queryKey: EXAM_QUERY_KEYS.attemptReport(attemptId),
                });
            }

            toast.success(
                payload.finalize
                    ? 'Report finalized successfully.'
                    : 'Override changes saved successfully.',
            );

            if (payload.finalize) {
                router.push(`/exams/reports/${examId}?section=attempts`);
            }
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to save report changes.');
        },
        onSettled: () => {
            setOptimisticScore(null);
        },
    });

    if (isLoading) {
        return <div className="mx-auto max-w-6xl p-6">Loading attempt report...</div>;
    }

    if (isError || !data) {
        return (
            <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
                <div className="text-2xl font-semibold">Attempt report unavailable</div>
                <p className="text-muted-foreground text-sm">
                    The report could not be loaded for this attempt in your current scope.
                </p>
                <Button variant="outline" asChild className="w-fit">
                    <Link href={`/exams/reports/${examId}?section=attempts`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Summary
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            {/* Desktop Sidebar */}
            <aside className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h2 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Report Sections
                    </h2>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <nav className="flex-1 space-y-1 p-3">
                    <Link
                        href={`/exams/reports/${examId}?section=overview`}
                        className="group text-muted-foreground hover:bg-accent/30 hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
                    >
                        Overview
                    </Link>
                    <Link
                        href={`/exams/reports/${examId}?section=attempts`}
                        className="group bg-accent/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#323d8f] transition-colors"
                    >
                        Attempt Summary
                    </Link>
                    <Link
                        href={`/exams/reports/${examId}?section=queue`}
                        className="group text-muted-foreground hover:bg-accent/30 hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
                    >
                        Action Queue
                    </Link>
                </nav>
            </aside>

            {/* Mobile Navigation */}
            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 flex gap-2 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm">
                    <Link
                        href={`/exams/reports/${examId}?section=overview`}
                        className="text-muted-foreground hover:text-foreground flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors"
                    >
                        Overview
                    </Link>
                    <Link
                        href={`/exams/reports/${examId}?section=attempts`}
                        className="bg-background flex-1 rounded-lg py-2 text-center text-sm font-semibold text-[#323d8f] shadow transition-colors"
                    >
                        Attempt Summary
                    </Link>
                    <Link
                        href={`/exams/reports/${examId}?section=queue`}
                        className="text-muted-foreground hover:text-foreground flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors"
                    >
                        Action Queue
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="min-w-0 flex-1 space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-slate-500" />
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    {data.attempt.studentName}
                                </h1>
                                <p className="text-muted-foreground">
                                    {data.attempt.studentNumber} • {data.attempt.subjectTitle}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/exams/reports/${examId}?section=attempts`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Summary
                        </Link>
                    </Button>
                </div>

                <AttemptReportView
                    attempt={data.attempt}
                    questions={data.questions}
                    editable
                    isSubmitting={saveMutation.isPending}
                    onSubmit={(payload) => saveMutation.mutate(payload)}
                    optimisticScore={optimisticScore}
                />
            </main>
        </div>
    );
}
