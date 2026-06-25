'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, useAttemptReportQuery } from '@sentinel/hooks';
import { updateGradingAttempt } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { Button } from '@sentinel/ui';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AttemptReportView } from '@/features/exams/reports';

export default function InstructorAttemptReportPage({
    params,
}: {
    params: Promise<{ examId: string; attemptId: string }>;
}) {
    const { examId, attemptId } = use(params);
    const apiClient = useApi();
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useAttemptReportQuery(attemptId);

    const saveMutation = useMutation({
        mutationFn: (payload: { itemOverrides: Record<string, any>; finalize: boolean }) =>
            updateGradingAttempt(apiClient, attemptId, {
                evaluations: data?.attempt.evaluations ?? {},
                feedback: data?.attempt.feedback ?? null,
                itemOverrides: payload.itemOverrides,
                finalize: payload.finalize,
            }),
        onSuccess: async (_, payload) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.attemptReport(attemptId),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.report(examId),
                }),
            ]);
            toast.success(
                payload.finalize
                    ? 'Report finalized successfully.'
                    : 'Override changes saved successfully.',
            );
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to save report changes.');
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
                    <Link href={`/exams/${examId}/report`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Summary
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">
                        <Link href="/exams/reports" className="hover:text-foreground transition-colors">
                            Reports
                        </Link>{' '}
                        /{' '}
                        <Link
                            href={`/exams/${examId}/report`}
                            className="hover:text-foreground transition-colors"
                        >
                            {data.attempt.examTitle}
                        </Link>{' '}
                        / <span>{data.attempt.studentName}</span>
                    </div>
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
                    <Link href={`/exams/${examId}/report`}>
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
            />
        </div>
    );
}
