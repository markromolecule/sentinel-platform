'use client';

import { PageHeader } from '@sentinel/ui';
import { GradingList } from '@/app/(protected)/(instructor)/exams/grading/_components/grading-list';

export function GradingView() {
    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <PageHeader
                title="Grading"
                description="Manage and grade student assessments."
                className="px-0"
            />
            <GradingList />
        </div>
    );
}
