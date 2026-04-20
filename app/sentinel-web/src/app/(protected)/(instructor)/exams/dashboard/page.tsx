'use client';

import { useState, Suspense } from 'react';
import { ExamCreateDialog, ExamsViewToggle } from '@/features/exams';
import {
    PageHeader,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
    Separator,
} from '@sentinel/ui';
import { Plus } from 'lucide-react';

import { useExamsDashboard } from './_hooks/use-exams-dashboard';
import { TAB_CONFIG, type ExamTabKey } from './_constants';
import { ExamsTabPanel } from './_components/exams-tab-panel';
import { AssignmentView } from './_views/assignment-view';
import { GradingView } from './_views/grading-view';

function ExamsDashboardContent() {
    const {
        examsByTab,
        isLoading,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        currentPageByTab,
        view,
        getPageCount,
        setPageForTab,
    } = useExamsDashboard();

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center">Loading exams...</div>;
    }

    if (view === 'assign') {
        return <AssignmentView />;
    }

    if (view === 'grade') {
        return <GradingView />;
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-5 md:p-6">
            <PageHeader
                title="Exams"
                description="Create, organize, and monitor your examinations in one place."
            >
                <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4" /> Create Exam
                </Button>
                <ExamCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            </PageHeader>

            <Separator />

            <div className="flex flex-col gap-4">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as ExamTabKey)}
                    className="space-y-4"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:w-auto">
                            <TabsList className="border-border/60 bg-muted/30 h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:w-auto [&::-webkit-scrollbar]:hidden">
                                {TAB_CONFIG.map(({ value, label }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="group/tab data-[state=active]:bg-background min-h-10 shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 shadow-none transition hover:bg-white/60 hover:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:text-[#323d8f] data-[state=active]:shadow-none dark:text-slate-300 dark:hover:bg-slate-800/60 dark:data-[state=active]:bg-slate-950"
                                    >
                                        <span>{label}</span>
                                        <span className="bg-background/80 text-muted-foreground rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition group-data-[state=active]/tab:bg-[#323d8f]/8 group-data-[state=active]/tab:text-[#323d8f]">
                                            {examsByTab[value].length}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="self-start lg:self-auto">
                            <ExamsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>
                    </div>

                    {TAB_CONFIG.map(({ value }) => (
                        <TabsContent key={value} value={value} className="m-0">
                            <ExamsTabPanel
                                tab={value}
                                exams={examsByTab[value]}
                                viewMode={viewMode}
                                currentPage={Math.min(
                                    currentPageByTab[value],
                                    getPageCount(examsByTab[value].length),
                                )}
                                pageCount={getPageCount(examsByTab[value].length)}
                                onPageChange={(page) => setPageForTab(value, page)}
                                onCreateClick={() => setIsCreateOpen(true)}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

export default function ExamsDashboardPage() {
    return (
        <Suspense fallback={<div className="flex h-96 items-center justify-center">Loading dashboard...</div>}>
            <ExamsDashboardContent />
        </Suspense>
    );
}
