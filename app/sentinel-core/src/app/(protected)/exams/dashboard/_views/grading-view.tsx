'use client';

import { PageHeader, Separator } from '@sentinel/ui';
import { GradingList } from '@/app/(protected)/exams/grading/_components/grading-list';

export function GradingView() {
    return (
        <div className="h-full flex-1 flex-col gap-6 p-8 md:flex">
            <div className="space-y-4">
                <PageHeader
                    title="Grading"
                    description="Manage and grade student assessments."
                    className="px-0"
                />
                <Separator />
            </div>
            <GradingList />
        </div>
    );
}
