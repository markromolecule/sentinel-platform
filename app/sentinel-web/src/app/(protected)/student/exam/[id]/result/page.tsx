'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@sentinel/hooks';
import { completeExamSession } from '@sentinel/services';
import { Button } from '@sentinel/ui';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ProctorExam } from '@sentinel/shared/types';
import { ArrowLeft, ClipboardCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { StudentExamLoadingState } from '../_components/student-exam-loading-state';
import { useStudentExamData } from '../_hooks/use-student-exam-data';
import { useTurnedInExamRedirect } from '../_hooks/use-turned-in-exam-redirect';
import {
    clearStoredExamTurnInPreview,
    readStoredExamTurnInPreview,
    type StoredExamTurnInPreview,
} from '../_lib/exam-turn-in-storage';
import { clearStoredExamSession } from '../_lib/exam-session-storage';
import { resolveStudentExamSessionError } from '../_lib/student-exam-session-feedback';

function formatPercentage(value: number | null) {
    return typeof value === 'number' ? `${value}%` : '--';
}

function markExamAsTurnedIn(
    exam: ProctorExam,
    attemptId: string,
    completedAt: string,
): ProctorExam {
    return {
        ...exam,
        status: 'turned_in',
        attemptId,
        completedAt,
    };
}

export default function StudentExamResultPage() {
    const router = useRouter();
    const apiClient = useApi();
    const queryClient = useQueryClient();
    const { examId, exam } = useStudentExamData();
    const [preview, setPreview] = useState<StoredExamTurnInPreview | null>(null);
    const [isTurningIn, setIsTurningIn] = useState(false);
    const isRedirectingToHistory = useTurnedInExamRedirect({
        examId,
        status: exam?.status,
        attemptId: exam?.attemptId,
        runtimeAccess: exam?.runtimeAccess,
    });

    useEffect(() => {
        setPreview(readStoredExamTurnInPreview(examId));
    }, [examId]);

    const summary = preview?.summary ?? null;
    const resultCopy = useMemo(() => {
        if (!summary) {
            return null;
        }

        if (summary.requiresManualReview) {
            return 'Objective items are scored now. Essay or manual-review items remain provisional until grading is completed.';
        }

        return 'This is the final auto-graded summary that will be stored when you turn in the attempt.';
    }, [summary]);

    if (isRedirectingToHistory) {
        return <StudentExamLoadingState />;
    }

    const handleTurnIn = async () => {
        if (!preview || isTurningIn) {
            return;
        }

        setIsTurningIn(true);

        try {
            const result = await completeExamSession(apiClient, {
                sessionId: preview.sessionId,
                answers: preview.answers,
                elapsedSeconds: preview.elapsedSeconds,
            });

            queryClient.setQueriesData({ queryKey: EXAM_QUERY_KEYS.all }, (cached) => {
                if (Array.isArray(cached)) {
                    return cached.map((cachedExam) =>
                        cachedExam?.id === examId
                            ? markExamAsTurnedIn(cachedExam, result.attemptId, result.completedAt)
                            : cachedExam,
                    );
                }

                if (
                    cached &&
                    typeof cached === 'object' &&
                    'id' in cached &&
                    (cached as ProctorExam).id === examId
                ) {
                    return markExamAsTurnedIn(
                        cached as ProctorExam,
                        result.attemptId,
                        result.completedAt,
                    );
                }

                return cached;
            });

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: ['exams', 'history'] }),
            ]);

            clearStoredExamTurnInPreview(examId);
            clearStoredExamSession(examId);

            toast.success('Exam turned in successfully.');
            router.replace(`/student/exam/${examId}/feedback?attemptId=${result.attemptId}`);
        } catch (error) {
            toast.error(resolveStudentExamSessionError(error));
            setIsTurningIn(false);
        }
    };

    if (!preview || !summary) {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
                <AlertTriangle className="text-muted-foreground h-12 w-12" />
                <div className="space-y-2">
                    <h1 className="text-foreground text-2xl font-semibold">
                        Result Preview Missing
                    </h1>
                    <p className="text-muted-foreground max-w-xl text-sm leading-6">
                        Return to the attempt page and submit the exam again to generate the turn-in
                        summary.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href={`/student/exam/${examId}/attempt`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Attempt
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Ready To Turn In
                </div>
                <div className="space-y-2">
                    <h1 className="text-foreground text-3xl font-semibold tracking-tight">
                        {exam?.title ?? 'Exam result summary'}
                    </h1>
                    <p className="text-muted-foreground max-w-3xl text-sm leading-6">
                        Review the computed score before you finalize the attempt. Once you turn in
                        the exam, the attempt will be marked as submitted.
                    </p>
                </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
                <div className="bg-card border-border/60 rounded-2xl border p-5">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                        Score
                    </p>
                    <p className="text-foreground mt-3 text-3xl font-semibold">
                        {summary.score}
                        <span className="text-muted-foreground ml-2 text-base font-normal">
                            / {summary.totalScore}
                        </span>
                    </p>
                </div>
                <div className="bg-card border-border/60 rounded-2xl border p-5">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                        Grade
                    </p>
                    <p className="text-foreground mt-3 text-3xl font-semibold">
                        {formatPercentage(summary.percentage)}
                    </p>
                </div>
                <div className="bg-card border-border/60 rounded-2xl border p-5">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                        Answered
                    </p>
                    <p className="text-foreground mt-3 text-3xl font-semibold">
                        {summary.answeredCount}
                    </p>
                </div>
                <div className="bg-card border-border/60 rounded-2xl border p-5">
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                        Manual Review
                    </p>
                    <p className="text-foreground mt-3 text-3xl font-semibold">
                        {summary.manualReviewQuestionCount}
                    </p>
                </div>
            </div>

            <div className="bg-card border-border/60 mt-6 rounded-2xl border p-5">
                <h2 className="text-foreground text-lg font-semibold">Turn-In Notes</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{resultCopy}</p>
                <p className="text-muted-foreground mt-4 text-sm leading-6">
                    Auto-graded questions: {summary.autoGradableQuestionCount}. Pending
                    manual-review questions: {summary.manualReviewQuestionCount}.
                </p>
            </div>

            <div className="mt-auto pt-8">
                <div className="bg-background/90 border-border/70 flex flex-col gap-3 border-t py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
                    <Button onClick={() => void handleTurnIn()} disabled={isTurningIn}>
                        {isTurningIn ? 'Turning In...' : 'Turn In'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
