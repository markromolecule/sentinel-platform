'use client';

import { GradingList } from '@/app/(protected)/(instructor)/exams/grading/_components/grading-list';
import { PageHeader } from '@sentinel/ui';
import { ExamsPageShell } from '../_components/layout';

export default function GradingPage() {
    return (
        <ExamsPageShell className="h-full flex-1 flex-col space-y-8">
            <PageHeader
                title="Grading"
                description="Manage and grade student assessments."
                className="px-0"
            />
            <GradingList />
        </ExamsPageShell>
    );
}
