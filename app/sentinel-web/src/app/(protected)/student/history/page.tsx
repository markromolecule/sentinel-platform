'use client';

import { Suspense } from 'react';
import { HistoryFilters } from '@/app/(protected)/student/history/_components/history-filters';
import { HistoryDateGroups } from '@/app/(protected)/student/history/_components/history-date-groups';
import { HistoryHeader } from '@/app/(protected)/student/history/_components/history-header';
import { HistoryTabs } from '@/app/(protected)/student/history/_components/history-tabs';
import { useStudentHistory } from '@/app/(protected)/student/history/_hooks/use-student-history';

function HistoryPageContent() {
    const {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        groupedHistory,
        isLoading,
    } = useStudentHistory();
    const emptyMessage = searchQuery
        ? `No results found for "${searchQuery}". Try a different search term.`
        : 'There are no exams in this category yet.';

    const loadingMessage =
        statusFilter === 'available' ? 'Loading available exams...' : 'Loading exam history...';
    const loadingSubmessage =
        statusFilter === 'available'
            ? 'Preparing your current exam list.'
            : 'Preparing your turned in and past due exams.';

    return (
        <div className="min-h-screen pb-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pt-4 sm:px-6 lg:px-8">
                <HistoryHeader
                    title="Examination"
                    description="View your past exam results and performance"
                />

                <div className="space-y-4 border-b border-border/60 pb-4">
                    <HistoryFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                    />

                    <HistoryTabs activeTab={statusFilter} onTabChange={setStatusFilter} />
                </div>

                {isLoading ? (
                    <div className="border-border/60 border px-6 py-14 text-center">
                        <p className="text-sm font-medium">{loadingMessage}</p>
                        <p className="text-muted-foreground mt-2 text-sm">{loadingSubmessage}</p>
                    </div>
                ) : (
                    <HistoryDateGroups groups={groupedHistory} emptyMessage={emptyMessage} />
                )}
            </div>
        </div>
    );
}

export default function StudentHistoryPage() {
    return (
        <Suspense fallback={null}>
            <HistoryPageContent />
        </Suspense>
    );
}
