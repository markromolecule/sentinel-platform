'use client';

import * as React from 'react';
import {
    AnalyticsReportsList,
    ExamCompletionChart,
    IncidentTrendsChart,
    AnalyticsKPICards,
    IncidentByTypeChart,
    DepartmentIntegrityChart,
} from '@/app/(protected)/analytics/_components';
import {
    MOCK_REPORTS,
    MOCK_EXAM_COMPLETION_DATA,
    MOCK_INCIDENT_TRENDS,
    MOCK_ANALYTICS_KPI_CARDS,
    MOCK_INCIDENT_TYPE_DISTRIBUTION,
    MOCK_DEPARTMENT_INTEGRITY_DATA,
} from '@sentinel/shared/mock-data';
import { PageHeader } from '@sentinel/ui';

/**
 * AnalyticsPage is the orchestrator for the premium administration analytics panel,
 * displaying interactive charts, KPIs, and reports inside a responsive CSS grid layout.
 */
export default function AnalyticsPage() {
    return (
        <div className="bg-background/50 flex min-h-screen flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="System Reports & Analytics"
                description="Real-time telemetry, session metrics, and integrity insights for the sentinel proctoring system."
            />

            {/* Row 1: KPI Statistics Overview */}
            <AnalyticsKPICards data={MOCK_ANALYTICS_KPI_CARDS} />

            {/* Row 2 & 3: Unified Visual Data Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Completion & Volume Trends */}
                <ExamCompletionChart data={MOCK_EXAM_COMPLETION_DATA} />
                <IncidentTrendsChart data={MOCK_INCIDENT_TRENDS} />

                {/* Outcomes Breakdown & Incident Telemetry */}
                <DepartmentIntegrityChart data={MOCK_DEPARTMENT_INTEGRITY_DATA} />
                <IncidentByTypeChart data={MOCK_INCIDENT_TYPE_DISTRIBUTION} />
            </div>

            {/* Row 4: Historically Generated Printable Reports */}
            <div className="border-border/40 border-t pt-6">
                <AnalyticsReportsList reports={MOCK_REPORTS} />
            </div>
        </div>
    );
}
