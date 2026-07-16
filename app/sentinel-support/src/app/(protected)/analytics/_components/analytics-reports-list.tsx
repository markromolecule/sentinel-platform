'use client';

import { ColumnDef, type PaginationState } from '@tanstack/react-table';
import { DataTable } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/status-badge';
import { AlertTriangle, Download, Loader2, RefreshCw } from 'lucide-react';
import { DataTableColumnHeader } from '@sentinel/ui';
import { AnalyticsReport } from '@sentinel/services';

export interface AnalyticsReportsListProps {
    reports: AnalyticsReport[];
    pagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    pageCount?: number;
    institutionNameById?: Record<string, string>;
    activeDownloadId?: string | null;
    activeRetryId?: string | null;
    canExportReports?: boolean;
    canRetryReports?: boolean;
    onDownload?: (reportId: string) => void;
    onRetry?: (reportId: string) => void;
}

const buildColumns = ({
    institutionNameById = {},
    activeDownloadId,
    activeRetryId,
    canExportReports,
    canRetryReports,
    onDownload,
    onRetry,
}: Pick<
    AnalyticsReportsListProps,
    | 'institutionNameById'
    | 'activeDownloadId'
    | 'activeRetryId'
    | 'canExportReports'
    | 'canRetryReports'
    | 'onDownload'
    | 'onRetry'
>): ColumnDef<AnalyticsReport>[] => [
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Report Title" />,
        cell: ({ row }) => (
            <div
                className="max-w-[240px] truncate font-medium xl:max-w-[320px]"
                title={row.getValue('title') as string}
            >
                {row.getValue('title')}
            </div>
        ),
    },
    {
        accessorKey: 'institutionId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
        cell: ({ row }) => {
            const institutionId = row.original.institutionId ?? '';
            const institutionName = institutionNameById[institutionId] ?? 'Unknown institution';
            return (
                <div className="max-w-[220px] truncate xl:max-w-[260px]" title={institutionName}>
                    {institutionName}
                </div>
            );
        },
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Document" />,
        cell: ({ row }) => (
            <div className="whitespace-nowrap capitalize">{row.getValue('type')}</div>
        ),
    },
    {
        accessorKey: 'generatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Generated At" />,
        cell: ({ row }) => {
            const val = row.getValue('generatedAt') as string | null;
            return (
                <div className="whitespace-nowrap">
                    {val ? new Date(val).toLocaleString() : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: 'format',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Format" />,
        cell: ({ row }) => {
            const val = row.getValue('format') as string | null;
            return <div className="uppercase">{val || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'expiresAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
        cell: ({ row }) => {
            const value = row.original.expiresAt;
            return (
                <div className="whitespace-nowrap">
                    {value ? new Date(value).toLocaleString() : 'Persistent'}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string | null;
            return <StatusBadge status={status || 'pending'} />;
        },
    },
    {
        id: 'details',
        header: 'Details',
        cell: ({ row }) => {
            const report = row.original;
            const status = report.status?.toUpperCase();
            const isDownloading = activeDownloadId === report.reportId;

            if (status === 'READY') {
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!canExportReports || isDownloading}
                        onClick={() => onDownload?.(report.reportId)}
                        className="h-8 px-2 whitespace-nowrap text-[#323d8f] hover:text-[#323d8f]"
                    >
                        {isDownloading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Download PDF
                    </Button>
                );
            }

            if (status !== 'FAILED') {
                return <span className="text-muted-foreground text-sm">No issues</span>;
            }

            const failureMessage = report.failureMessage || 'Report generation failed.';
            return (
                <div
                    className="flex max-w-[220px] items-start gap-2 text-sm text-red-600"
                    title={failureMessage}
                >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2 break-words">{failureMessage}</span>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="min-w-[148px] text-right">Actions</div>,
        cell: ({ row }) => {
            const report = row.original;
            const status = report.status?.toUpperCase();
            const isRetrying = activeRetryId === report.reportId;

            return (
                <div className="flex min-w-[148px] justify-end gap-2">
                    {status === 'FAILED' ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canRetryReports || isRetrying}
                            onClick={() => onRetry?.(report.reportId)}
                            className="px-2 whitespace-nowrap"
                        >
                            {isRetrying ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Retry
                        </Button>
                    ) : null}

                    {status === 'GENERATING' || status === 'PENDING' ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="px-2 whitespace-nowrap"
                        >
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {status === 'PENDING' ? 'Queued' : 'Generating'}
                        </Button>
                    ) : null}

                    {status === 'EXPIRED' ? (
                        <span className="text-muted-foreground text-sm">Expired</span>
                    ) : null}
                </div>
            );
        },
    },
];

export function AnalyticsReportsList({
    reports,
    pagination,
    onPaginationChange,
    pageCount,
    institutionNameById,
    activeDownloadId,
    activeRetryId,
    canExportReports,
    canRetryReports,
    onDownload,
    onRetry,
}: AnalyticsReportsListProps) {
    const facets = [
        {
            columnKey: 'status',
            title: 'Status',
            options: [
                { label: 'Queued', value: 'PENDING' },
                { label: 'Generating', value: 'GENERATING' },
                { label: 'Ready', value: 'READY' },
                { label: 'Failed', value: 'FAILED' },
                { label: 'Expired', value: 'EXPIRED' },
            ],
        },
    ];

    return (
        <section className="space-y-4">
            <DataTable
                columns={buildColumns({
                    institutionNameById,
                    activeDownloadId,
                    activeRetryId,
                    canExportReports,
                    canRetryReports,
                    onDownload,
                    onRetry,
                })}
                data={reports}
                searchKey="title"
                facets={facets}
                initialColumnVisibility={{ type: false, institutionId: false }}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                pageCount={pageCount}
                manualPagination={!!pagination}
            />
        </section>
    );
}
