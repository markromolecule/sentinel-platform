'use client';

import { HistoryFilters } from '@/app/(protected)/student/history/_components/history-filters';
import { HistoryDateGroups } from '@/app/(protected)/student/history/_components/history-date-groups';
import { HistoryHeader } from '@/app/(protected)/student/history/_components/history-header';
import { HistoryTabs } from '@/app/(protected)/student/history/_components/history-tabs';
import { useStudentHistory } from '@/app/(protected)/student/history/_hooks/use-student-history';

export default function StudentHistoryPage() {
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

    return (
        <div className="min-h-screen space-y-8 pb-10">
            <HistoryHeader
                title="History"
                description="View your past exam results and performance"
            />

            <HistoryFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            <div className="space-y-5">
                <HistoryTabs activeTab={statusFilter} onTabChange={setStatusFilter} />

                {isLoading ? (
                    <div className="bg-muted/40 border-border/60 rounded-2xl border px-6 py-16 text-center">
                        <p className="text-sm font-medium">Loading exam history...</p>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Preparing your turned in and past due exams.
                        </p>
                    </div>
                ) : (
                    <HistoryDateGroups groups={groupedHistory} emptyMessage={emptyMessage} />
                )}
            </div>
        </div>
    );
}
