'use client';

import { use } from 'react';
import { IncidentLogsView } from '@/features/exams/logs';
import { OverviewView } from './overview-view';
import { AttemptsView } from './attempts-view';
import { ActionQueueView } from './action-queue-view';
import { useExamReport } from '../_hooks/use-exam-report';
import { ReportNavigation } from './report-navigation';
import { ReportLoading } from './report-loading';
import { ReportError } from './report-error';

/**
 * Client page content for the instructor detailed exam report route.
 * Resolves dynamic params inside the Suspense boundary owned by the page wrapper.
 */
export function ExamReportPageContent({ params }: { params: Promise<{ examId: string }> }) {
    const examId = use(params).examId;
    const {
        report,
        isLoading,
        isError,
        isFetching,
        refetch,
        activeSection,
        setActiveSection,
        searchValue,
        setSearchValue,
        sectionFilter,
        setSectionFilter,
        sectionOptions,
        studentPage,
        setStudentPage,
        pageSize,
        columns,
        isFinalizingAll,
        handleFinalizeAll,
        activeQueue,
        setActiveQueue,
        actionPages,
        setActionPages,
        activeActionId,
        actionQueues,
        handleGrantOverride,
    } = useExamReport({ examId });

    if (isLoading) {
        return <ReportLoading />;
    }

    if (isError || !report) {
        return <ReportError refetch={refetch} />;
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            <ReportNavigation activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="min-w-0 flex-1 space-y-6 p-4 md:p-6 lg:p-8">
                {activeSection === 'overview' && (
                    <OverviewView report={report} refetch={refetch} isFetching={isFetching} />
                )}

                {activeSection === 'attempts' && (
                    <AttemptsView
                        report={report}
                        columns={columns}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        sectionFilter={sectionFilter}
                        setSectionFilter={setSectionFilter}
                        sectionOptions={sectionOptions}
                        studentPage={studentPage}
                        setStudentPage={setStudentPage}
                        pageSize={pageSize}
                        onFinalizeAll={handleFinalizeAll}
                        isFinalizingAll={isFinalizingAll}
                    />
                )}

                {activeSection === 'queue' && (
                    <ActionQueueView
                        actionQueues={actionQueues}
                        activeQueue={activeQueue}
                        setActiveQueue={setActiveQueue}
                        actionPages={actionPages}
                        setActionPages={setActionPages}
                        activeActionId={activeActionId}
                        examId={examId}
                        sectionOptions={sectionOptions}
                        onGrantOverride={handleGrantOverride}
                    />
                )}

                {activeSection === 'logs' && <IncidentLogsView examId={examId} />}
            </main>
        </div>
    );
}
