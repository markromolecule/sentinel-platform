'use client';

import { Button } from '@sentinel/ui';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheatingReport } from '@/components/sidebar/student/CheatingReport';
import { ExamDetailStats } from '@/app/(protected)/student/history/details/_components/exam-detail-stats';
import { ExamHeader } from '@/app/(protected)/student/history/details/_components/exam-header';
import { ExamHeroScore } from '@/app/(protected)/student/history/details/_components/exam-hero-score';
import { ExamInfo } from '@/app/(protected)/student/history/details/_components/exam-info';
import { useExamDetails } from '@/app/(protected)/student/history/details/_hooks/use-exam-details';

function HistoryDetailsContent() {
    const { historyItem, isLoading } = useExamDetails();

    if (isLoading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="border-border/60 border px-6 py-14 text-center">
                    <p className="text-sm font-medium">Loading exam details...</p>
                </div>
            </div>
        );
    }

    if (!historyItem) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
                <AlertTriangle className="text-muted-foreground h-16 w-16" />
                <h2 className="text-foreground text-2xl font-bold">Exam Result Not Found</h2>
                <Button asChild variant="outline">
                    <Link href="/student/history">Return to History</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pt-4 pb-10 sm:px-6 lg:px-8">
            <ExamHeader subject={historyItem.subject} status={historyItem.status} />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                    <ExamInfo
                        title={historyItem.examTitle}
                        primaryDateLabel={
                            historyItem.status === 'turned_in'
                                ? 'Turned In'
                                : historyItem.status === 'past_due'
                                  ? 'Due'
                                  : 'Available'
                        }
                        primaryDateValue={
                            historyItem.status === 'turned_in'
                                ? historyItem.completedAt ?? historyItem.dueAt ?? null
                                : historyItem.status === 'past_due'
                                  ? historyItem.dueAt ?? null
                                  : historyItem.availableAt ?? historyItem.dueAt ?? null
                        }
                        timeSpent={historyItem.timeSpent ?? null}
                    />

                    <ExamDetailStats
                        score={historyItem.score ?? null}
                        totalScore={historyItem.totalScore ?? null}
                        percentage={historyItem.percentage ?? null}
                    />

                    <CheatingReport
                        cheated={historyItem.cheated}
                        cheatingType={historyItem.cheatingType ?? undefined}
                    />
                </div>

                <ExamHeroScore
                    percentage={historyItem.percentage ?? null}
                    result={historyItem.result ?? null}
                />
            </div>
        </div>
    );
}

export default function HistoryDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="border-border/60 border px-6 py-14 text-center">
                        <p className="text-sm font-medium">Loading exam details...</p>
                    </div>
                </div>
            }
        >
            <HistoryDetailsContent />
        </Suspense>
    );
}
