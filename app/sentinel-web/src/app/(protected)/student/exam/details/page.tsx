'use client';

import { Suspense } from 'react';
import { ChevronLeft } from 'lucide-react';

import { useExamDetails } from '@/app/(protected)/student/exam/details/_hooks/use-exam-details';
import { ExamBanner } from '@/app/(protected)/student/exam/details/_components/exam-banner';
import { ExamInfoBar } from '@/app/(protected)/student/exam/details/_components/exam-info-bar';
import { ExamDescription } from '@/app/(protected)/student/exam/details/_components/exam-description';
import { ExamSidebar } from '@/app/(protected)/student/exam/details/_components/exam-sidebar';
import { ExamNotFound } from '@/app/(protected)/student/exam/details/_components/exam-not-found';
import { ExamLoading } from '@/app/(protected)/student/exam/details/_components/exam-loading';

function ExamDetailsContent() {
    const { exam, handleBack } = useExamDetails();

    if (!exam) {
        return <ExamNotFound onBack={handleBack} />;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground group flex w-fit items-center gap-2 transition-colors"
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Exams
            </button>

            {/* Main Content Card */}
            <div className="bg-card border-border/50 overflow-hidden rounded-2xl border">
                {/* Banner */}
                <ExamBanner exam={exam} />

                <div className="space-y-8 p-6 md:p-8">
                    {/* Info Bar */}
                    <ExamInfoBar exam={exam} />

                    {/* Main Details and Sidebar */}
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <ExamDescription description={exam.description} />
                        </div>

                        {/* Sidebar Stats */}
                        <div>
                            <ExamSidebar exam={exam} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ExamDetailsPage() {
    return (
        <Suspense fallback={<ExamLoading />}>
            <ExamDetailsContent />
        </Suspense>
    );
}
