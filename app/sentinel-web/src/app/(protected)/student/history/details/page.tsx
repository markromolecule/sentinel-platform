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
    const { historyItem } = useExamDetails();

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
                        dateTaken={historyItem.dateTaken}
                        timeSpent={historyItem.timeSpent}
                    />

                    {/* Stats Cards */}
                    <ExamDetailStats
                        score={historyItem.score}
                        totalScore={historyItem.totalScore}
                        percentage={historyItem.percentage}
                    />

                    {/* Modular Cheating Report */}
                    <CheatingReport
                        cheated={historyItem.cheated}
                        cheatingType={historyItem.cheatingType}
                    />
                </div>

                {/* Right Column: Hero Score */}
                <ExamHeroScore percentage={historyItem.percentage} status={historyItem.status} />
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
