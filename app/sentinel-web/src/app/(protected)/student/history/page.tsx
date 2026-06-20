'use client';

import { Suspense, useEffect, useRef } from 'react';
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
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useStudentHistory();

    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const target = observerTargetRef.current;
        if (!target || !hasNextPage || statusFilter === 'available') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                rootMargin: '200px',
            },
        );

        observer.observe(target);
        return () => {
            observer.disconnect();
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, statusFilter]);

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
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-5 py-5 duration-500">
            <HistoryHeader
                title="Examination"
                description="View your past exam results and performance"
            />

            <div className="border-border/60 space-y-4 border-b pb-4">
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
                <>
                    <HistoryDateGroups groups={groupedHistory} emptyMessage={emptyMessage} />

                    {hasNextPage && statusFilter !== 'available' && (
                        <div
                            ref={observerTargetRef}
                            className="text-muted-foreground flex items-center justify-center py-4 text-xs font-semibold"
                        >
                            {isFetchingNextPage ? 'Loading more history...' : 'Scroll down to load more'}
                        </div>
                    )}
                </>
            )}
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
