'use client';

import { type LogRecord } from '@sentinel/services';
import { DataTable } from '@sentinel/ui';
import { columns } from './columns';
import { PaginationState } from '@tanstack/react-table';

interface AuditLogTableProps {
    logs: LogRecord[];
    isLoading?: boolean;
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    pageCount?: number;
    totalCount?: number;
}

export function AuditLogTable({
    logs,
    isLoading,
    pagination,
    onPaginationChange,
    pageCount,
    totalCount,
}: AuditLogTableProps) {
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-muted-foreground text-sm font-medium">Loading audit logs...</p>
                </div>
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={logs}
            searchKey="action"
            searchPlaceholder="Search by action name (e.g. user.login)..."
            facets={[
                {
                    columnKey: 'action',
                    title: 'Action Type',
                    options: [
                        { label: 'Login', value: 'user.login' },
                        { label: 'Exam Start', value: 'exam.start' },
                        { label: 'Exam End', value: 'exam.end' },
                        { label: 'Config Update', value: 'config.update' },
                    ],
                },
                {
                    columnKey: 'resourceType',
                    title: 'Resource Category',
                    options: [
                        { label: 'Auth', value: 'auth' },
                        { label: 'Exam', value: 'exam' },
                        { label: 'System', value: 'system' },
                        { label: 'User', value: 'user' },
                    ],
                },
            ]}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            pageCount={pageCount}
            totalCount={totalCount}
            manualPagination={!!pagination}
        />
    );
}
