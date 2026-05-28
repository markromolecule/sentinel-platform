'use client';

import { useState } from 'react';
import { useSystemLogsQuery } from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import { AuditLogTable } from './audit-log-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SystemLogTable displays a paginated table of internal system logs.
 * It manages its own state and fetches data using the useSystemLogsQuery hook.
 */
export function SystemLogTable() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isFetching, isError, error } = useSystemLogsQuery({
        params: { page, pageSize },
    });

    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;
    const hasMore = data?.hasMore ?? false;
    const isCurrentlyLoading = isLoading || isFetching;

    return (
        <div className="space-y-4">
            {isError && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20 mt-4">
                    Failed to fetch system logs: {error?.message || 'Unknown error occurred.'}
                </div>
            )}

            <AuditLogTable logs={items} isLoading={isLoading} />

            {/* Pagination Controls */}
            {data && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground">
                        Showing page <span className="font-semibold text-foreground">{page}</span> of{' '}
                        <span className="font-semibold text-foreground">{totalPages}</span> (Total:{' '}
                        <span className="font-semibold text-foreground">{data.total}</span> logs)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || isCurrentlyLoading}
                            className="h-8 px-3 text-xs gap-1 flex items-center"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages || !hasMore || isCurrentlyLoading}
                            className="h-8 px-3 text-xs gap-1 flex items-center"
                        >
                            Next
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
