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
        return <div className="p-10 text-white/60">Loading exam details...</div>;
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
        <div className="mx-auto max-w-5xl space-y-6 pt-2 pb-10">
            {/* Header / Nav */}
            <ExamHeader subject={historyItem.subject} status={historyItem.status} />

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Info & Stats */}
                <div className="space-y-8 md:col-span-2">
                    {/* Exam Title & Meta */}
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

                    {/* Stats Cards */}
                    <ExamDetailStats
                        score={historyItem.score ?? null}
                        totalScore={historyItem.totalScore ?? null}
                        percentage={historyItem.percentage ?? null}
                    />

                    {/* Modular Cheating Report */}
                    <CheatingReport
                        cheated={historyItem.cheated}
                        cheatingType={historyItem.cheatingType ?? undefined}
                    />
                </div>

                {/* Right Column: Hero Score */}
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
        <Suspense fallback={<div className="p-10 text-white/60">Loading exam details...</div>}>
            <HistoryDetailsContent />
        </Suspense>
    );
}
