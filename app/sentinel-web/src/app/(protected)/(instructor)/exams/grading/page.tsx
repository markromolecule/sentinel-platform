'use client';

import { GradingList } from '@/app/(protected)/(instructor)/exams/grading/_components/grading-list';
import { PageHeader, Separator } from '@sentinel/ui';
import { ExamsPageShell } from '../_components/layout';

export default function GradingPage() {
    return (
        <ExamsPageShell className="h-full flex-1 flex-col">
            <div className="space-y-4">
                <PageHeader
                    title="Grading"
                    description="Manage and grade student assessments."
                    className="px-0"
                />
                <Separator />
            </div>
            <GradingList />
        </ExamsPageShell>
    );
}
