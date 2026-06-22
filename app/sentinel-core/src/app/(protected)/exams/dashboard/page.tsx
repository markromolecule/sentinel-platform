'use client';

import { useState, Suspense } from 'react';
import { ExamCreateDialog, ExamsViewToggle } from '@/features/exams';
import { PageHeader, Tabs, TabsContent, Button, Separator, Spinner } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { PermissionGuard } from '@sentinel/hooks';


import { useExamsDashboard } from './_hooks/use-exams-dashboard';
import { TAB_CONFIG, type ExamTabKey } from './_constants';
import { ExamsTabPanel } from './_components/exams-tab-panel';
import { ExamsFilterTabs } from './_components/exams-filter-tabs';
import { AssignmentView } from './_views/assignment-view';
import { GradingView } from './_views/grading-view';
import { ExamsPageShell } from '../_components/layout';

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
        return (
            <div className="flex h-96 items-center justify-center">
                <Spinner className="text-primary size-8" />
            </div>
        );
    }

    if (view === 'assign') {
        return <AssignmentView />;
    }

    if (view === 'grade') {
        return <GradingView />;
    }

    return (
        <ExamsPageShell>
            <PageHeader
                title="Exams"
                description="Create, organize, and monitor your examinations in one place."
            >
                <PermissionGuard permission="assessments:manage">
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4" /> Create Exam
                    </Button>
                    <ExamCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
                </PermissionGuard>
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
                            <ExamsFilterTabs
                                activeTab={activeTab}
                                counts={{
                                    all: examsByTab.all.length,
                                    published: examsByTab.published.length,
                                    drafts: examsByTab.drafts.length,
                                    archived: examsByTab.archived.length,
                                }}
                                onValueChange={(value) => setActiveTab(value)}
                            />
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
        </ExamsPageShell>
    );
}

export default function ExamsDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-96 items-center justify-center">
                    <Spinner className="text-primary size-8" />
                </div>
            }
        >
            <ExamsDashboardContent />
        </Suspense>
    );
}
