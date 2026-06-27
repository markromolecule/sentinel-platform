'use client';

import { Suspense, use, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApi, useExamReportQuery } from '@sentinel/hooks';
import { createStudentExamAccessOverride, bulkFinalizeAttempts } from '@sentinel/services';
import type { ExamReport, ExamReportActionItem } from '@sentinel/shared/types';
import { Button, Separator } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@sentinel/ui';
import { getColumns } from './_components/columns';
import { OverviewView } from './_components/overview-view';
import { AttemptsView } from './_components/attempts-view';
import { ActionQueueView } from './_components/action-queue-view';

type ActionQueueType = 'review' | 'makeup' | 'retake';

/**
 * Main instructor detailed exam report page content component.
 * Manages core query variables, fetching states, sidebar navigation, and override grants.
 */
function ExamReportContent({ id }: { id: string }) {
    const apiClient = useApi();
    const searchParams = useSearchParams();
    const sectionParam = searchParams.get('section');

    const [activeSection, setActiveSection] = useState<'overview' | 'attempts' | 'queue'>(() => {
        if (sectionParam === 'attempts' || sectionParam === 'queue') {
            return sectionParam;
        }
        return 'overview';
    });

    useEffect(() => {
        if (sectionParam === 'attempts' || sectionParam === 'queue' || sectionParam === 'overview') {
            setActiveSection(sectionParam);
        }
    }, [sectionParam]);

    const [searchValue, setSearchValue] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string | undefined>(undefined);
    const [studentPage, setStudentPage] = useState(1);
    const [activeQueue, setActiveQueue] = useState<ActionQueueType>('review');
    const [actionPages, setActionPages] = useState<Record<ActionQueueType, number>>({
        review: 1,
        makeup: 1,
        retake: 1,
    });
    const [activeActionId, setActiveAsctionId] = useState<string | null>(null);
    const deferredSearchValue = useDeferredValue(searchValue);
    const pageSize = 10;

    const reportQuery = useMemo(
        () => ({
            search: deferredSearchValue.trim() || undefined,
            sectionId: sectionFilter,
            page: studentPage,
            pageSize,
        }),
        [deferredSearchValue, sectionFilter, studentPage],
    );

    const { data: report, isLoading, isError, refetch, isFetching } = useExamReportQuery(
        id,
        reportQuery,
    );

    useEffect(() => {
        setStudentPage(1);
    }, [deferredSearchValue, sectionFilter]);

    const sectionOptions = useMemo(
        () => (report?.sections ?? []).map((section) => [section.id, section.name] as const),
        [report?.sections],
    );

    const actionQueues = useMemo(
        () =>
            report
                ? {
                    review: report.actionItems.review,
                    makeup: report.actionItems.makeup,
                    retake: report.actionItems.retake,
                }
                : {
                    review: [],
                    makeup: [],
                    retake: [],
                },
        [report],
    );

    const columns = useMemo(() => getColumns(id), [id]);

    const handleGrantOverride = async (
        item: ExamReportActionItem,
        overrideType: 'MAKEUP' | 'RETAKE',
    ) => {
        const minutesInput = window.prompt(
            `Grant a ${overrideType === 'MAKEUP' ? 'makeup' : 'retake'} window for how many minutes?`,
            '120',
        );

        if (!minutesInput) {
            return;
        }

        const minutes = Number(minutesInput);

        if (!Number.isFinite(minutes) || minutes <= 0) {
            toast.error('Enter a valid availability window in minutes.');
            return;
        }

        const notes = window.prompt(
            `Add a note for this ${overrideType === 'MAKEUP' ? 'makeup' : 'retake'} grant.`,
            overrideType === 'MAKEUP' ? 'Approved makeup window.' : 'Approved retake window.',
        );

        setActiveAsctionId(item.studentId);

        try {
            await createStudentExamAccessOverride(apiClient, {
                id,
                studentId: item.studentId,
                overrideType,
                availableFrom: new Date().toISOString(),
                availableUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
                allowedAttempts: 1,
                sourceAttemptId: overrideType === 'RETAKE' ? item.attemptId : null,
                notes: notes?.trim() ? notes.trim() : null,
            });

            toast.success(
                overrideType === 'MAKEUP'
                    ? 'Makeup window granted successfully.'
                    : 'Retake window granted successfully.',
            );
            await refetch();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to grant override.');
        } finally {
            setActiveAsctionId(null);
        }
    };

    const [isFinalizingAll, setIsFinalizingAll] = useState(false);

    const handleFinalizeAll = async () => {
        setIsFinalizingAll(true);
        try {
            const result = await bulkFinalizeAttempts(apiClient, id);
            toast.success(`Successfully finalized ${result.count} attempt(s).`);
            await refetch();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to finalize attempts.');
        } finally {
            setIsFinalizingAll(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-1 flex-col space-y-6 p-6 md:p-8">
                <div className="space-y-2">
                    <div className="bg-muted h-8 w-64 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-80 animate-pulse rounded" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-muted h-28 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="flex h-full flex-1 flex-col space-y-6 p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Exam Report</h1>
                        <p className="text-muted-foreground">
                            The exam report could not be loaded for this exam.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/exams">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Exams
                        </Link>
                    </Button>
                </div>
                <div className="rounded-xl border border-dashed px-4 py-6">
                    <p className="text-muted-foreground text-sm">
                        Try refreshing the report. If the issue persists, the exam may not be
                        available in your current scope.
                    </p>
                    <Button className="mt-4" onClick={() => refetch()}>
                        Retry Report
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            {/* Desktop Sidebar */}
            <aside className="bg-background sticky -top-6 hidden w-64 shrink-0 flex-col border-r lg:flex">
                <div className="flex h-14 shrink-0 items-center px-4">
                    <h2 className="text-foreground text-[1.1rem] font-bold tracking-tight">
                        Report Sections
                    </h2>
                </div>
                <Separator className="bg-border/40 shrink-0" />
                <nav className="flex-1 space-y-1 p-3">
                    <button
                        onClick={() => setActiveSection('overview')}
                        className={cn(
                            'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                            activeSection === 'overview'
                                ? 'bg-accent/50 font-semibold text-[#323d8f]'
                                : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveSection('attempts')}
                        className={cn(
                            'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                            activeSection === 'attempts'
                                ? 'bg-accent/50 font-semibold text-[#323d8f]'
                                : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                        )}
                    >
                        Attempt Summary
                    </button>
                    <button
                        onClick={() => setActiveSection('queue')}
                        className={cn(
                            'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                            activeSection === 'queue'
                                ? 'bg-accent/50 font-semibold text-[#323d8f]'
                                : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                        )}
                    >
                        Action Queue
                    </button>
                </nav>
            </aside>

            {/* Mobile Navigation */}
            <div className="px-4 pt-6 lg:hidden">
                <div className="bg-card/20 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm flex gap-2">
                    <button
                        onClick={() => setActiveSection('overview')}
                        className={cn(
                            'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors',
                            activeSection === 'overview'
                                ? 'bg-background shadow text-[#323d8f]'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveSection('attempts')}
                        className={cn(
                            'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors',
                            activeSection === 'attempts'
                                ? 'bg-background shadow text-[#323d8f]'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        Attempt Summary
                    </button>
                    <button
                        onClick={() => setActiveSection('queue')}
                        className={cn(
                            'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors',
                            activeSection === 'queue'
                                ? 'bg-background shadow text-[#323d8f]'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        Action Queue
                    </button>
                </div>
            </div>

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
            </main>
        </div>
    );
}

/**
 * Main instructor detailed exam report page component.
 * Wraps the content in a Suspense boundary for SSR-safe search parameters handling.
 */
export default function ExamReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <Suspense
            fallback={
                <div className="flex h-full flex-1 flex-col space-y-6 p-6 md:p-8">
                    <div className="space-y-2">
                        <div className="bg-muted h-8 w-64 animate-pulse rounded" />
                        <div className="bg-muted h-4 w-80 animate-pulse rounded" />
                    </div>
                </div>
            }
        >
            <ExamReportContent id={id} />
        </Suspense>
    );
}
