'use client';

import { useState } from 'react';
import { type PaginationState } from '@tanstack/react-table';
import { useActivePermissions, useDebounce, useFeedbacksQuery } from '@sentinel/hooks';
import {
    PageHeader,
    PermissionDeniedState,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
} from '@sentinel/ui';
import type { FeedbackRecord } from '@sentinel/services';
import { FeedbackDetailDialog } from './_components/feedback-detail-dialog';
import { FeedbackSummaryCards } from './_components/feedback-summary-cards';
import { FeedbacksTable } from './_components/feedbacks-table';

export default function FeedbacksPage() {
    const { hasPermission } = useActivePermissions();
    const canViewFeedback = hasPermission('feedback:view');
    const [search, setSearch] = useState('');
    const [rating, setRating] = useState<string>('all');
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const debouncedSearch = useDebounce(search, 300);
    const ratingFilter = rating === 'all' ? undefined : Number(rating);

    const feedbackQuery = useFeedbacksQuery({
        params: {
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            rating: ratingFilter,
            search: debouncedSearch || undefined,
        },
        enabled: canViewFeedback,
    });

    if (!canViewFeedback) {
        return <PermissionDeniedState resourceName="feedback" />;
    }

    const page = feedbackQuery.data ?? {
        items: [],
        page: 1,
        pageSize: pagination.pageSize,
        total: 0,
        totalPages: 0,
        hasMore: false,
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Feedback"
                description="Review post-exam student feedback with server-side pagination and rating filters."
            />

            <Separator />

            <FeedbackSummaryCards page={page} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Select
                    value={rating}
                    onValueChange={(value) => {
                        setRating(value);
                        setPagination((current) => ({ ...current, pageIndex: 0 }));
                    }}
                >
                    <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="Filter rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All ratings</SelectItem>
                        <SelectItem value="5">5 / 5</SelectItem>
                        <SelectItem value="4">4 / 5</SelectItem>
                        <SelectItem value="3">3 / 5</SelectItem>
                        <SelectItem value="2">2 / 5</SelectItem>
                        <SelectItem value="1">1 / 5</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <FeedbacksTable
                feedbacks={page.items}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={page.totalPages}
                totalCount={page.total}
                isLoading={feedbackQuery.isLoading}
                searchTerm={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
                onOpenFeedback={setSelectedFeedback}
            />

            <FeedbackDetailDialog
                feedback={selectedFeedback}
                open={selectedFeedback !== null}
                onOpenChange={(open) => !open && setSelectedFeedback(null)}
            />
        </div>
    );
}
