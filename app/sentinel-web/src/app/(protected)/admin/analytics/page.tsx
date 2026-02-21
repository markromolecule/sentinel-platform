"use client";

import {
    AnalyticsReportsList,
    ExamCompletionChart,
    IncidentTrendsChart
} from "@/app/(protected)/admin/analytics/_components/index";
import { MOCK_REPORTS, MOCK_EXAM_COMPLETION_DATA, MOCK_INCIDENT_TRENDS } from '@sentinel/shared/constants';;
import { PageHeader } from "@/components/common";

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Reports & Analytics"
                description="Visual insights into system performance and exam data."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ExamCompletionChart data={MOCK_EXAM_COMPLETION_DATA} />
                <IncidentTrendsChart data={MOCK_INCIDENT_TRENDS} />
            </div>
            <AnalyticsReportsList reports={MOCK_REPORTS} />
        </div>
    );
}
