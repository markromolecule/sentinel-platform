'use client';

import { useState } from 'react';
import { useSystemLogsQuery, useServerPagination } from '@sentinel/hooks';
import { AuditLogTable } from './audit-log-table';

/**
 * SystemLogTable displays a paginated table of internal system logs.
 * It manages its own state and fetches data using the useSystemLogsQuery hook.
 */
export function SystemLogTable() {
    const { pagination, setPagination } = useServerPagination([], {
        pageIndex: 0,
        pageSize: 20,
    });

    const { data, isLoading, isError, error } = useSystemLogsQuery({
        params: {
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
        },
    });

    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;
    const totalCount = data?.total ?? 0;

    return (
        <div className="space-y-4">
            {isError && (
                <div className="bg-destructive/10 text-destructive border-destructive/20 mt-4 rounded-lg border p-4 text-xs">
                    Failed to fetch system logs: {error?.message || 'Unknown error occurred.'}
                </div>
            )}

            <AuditLogTable
                logs={items}
                isLoading={isLoading}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={totalPages}
                totalCount={totalCount}
            />
        </div>
    );
}
