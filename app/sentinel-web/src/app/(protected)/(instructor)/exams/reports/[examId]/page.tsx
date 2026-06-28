'use client';

import { Suspense, use } from 'react';
import { IncidentLogsView } from '@/features/exams/logs';
import { OverviewView } from './_components/overview-view';
import { AttemptsView } from './_components/attempts-view';
import { ActionQueueView } from './_components/action-queue-view';
import { useExamReport } from './_hooks/use-exam-report';
import { ReportNavigation } from './_components/report-navigation';
import { ReportLoading } from './_components/report-loading';
import { ReportError } from './_components/report-error';

/**
 * Main instructor detailed exam report page content component.
 * Manages rendering the navigation sidebar/mobile tabs and the active report section.
 */
function ExamReportContent({ id }: { id: string }) {
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
    } = useExamReport({ examId: id });

    if (isLoading) {
        return <ReportLoading />;
    }

    if (isError || !report) {
        return <ReportError refetch={refetch} />;
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            {/* Unified Desktop Sidebar & Mobile Navigation */}
            <ReportNavigation
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />

            {/* Main Content Area */}
            <main className="min-w-0 flex-1 space-y-6 p-4 md:p-6 lg:p-8">
                {activeSection === 'overview' && (
                    <OverviewView
                        report={report}
                        refetch={refetch}
                        isFetching={isFetching}
                    />
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
                        examId={id}
                        sectionOptions={sectionOptions}
                        onGrantOverride={handleGrantOverride}
                    />
                )}

                {activeSection === 'logs' && (
                    <IncidentLogsView examId={id} />
                )}
            </main>
        </div>
    );
}

/**
 * Main instructor detailed exam report page component.
 * Wraps the content in a Suspense boundary for SSR-safe search parameters handling.
 *
 * @param props - Component props containing parameters with target exam ID.
 */
export default function ExamReportPage({ params }: { params: Promise<{ examId: string }> }) {
    const { examId } = use(params);

    return (
        <Suspense fallback={<ReportLoading />}>
            <ExamReportContent id={examId} />
        </Suspense>
    );
}
