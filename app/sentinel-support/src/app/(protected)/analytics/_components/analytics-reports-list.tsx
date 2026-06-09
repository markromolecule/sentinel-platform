'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { StatusBadge } from '@/components/common/status-badge';
import { Download, FileBarChart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@sentinel/ui';
import { DataTableColumnHeader } from '@sentinel/ui';
import { AnalyticsReport, GenerateAnalyticsReportBody } from '@sentinel/services';

export interface AnalyticsReportsListProps {
    reports: AnalyticsReport[];
    onGenerateReport?: (payload: GenerateAnalyticsReportBody) => void;
}

const columns: ColumnDef<AnalyticsReport>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Report Title" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => <div className="capitalize">{row.getValue('type')}</div>,
    },
    {
        accessorKey: 'generatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Generated At" />,
        cell: ({ row }) => {
            const val = row.getValue('generatedAt') as string | null;
            return <div>{val ? new Date(val).toLocaleString() : 'N/A'}</div>;
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string | null;
            return <StatusBadge status={status || 'pending'} />;
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const report = row.original;
            const status = report.status?.toLowerCase();
            return (
                <div className="text-right">
                    {status === 'ready' && report.fileUrl ? (
                        <Button variant="ghost" size="sm" asChild>
                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    ) : status === 'ready' ? (
                        <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    ) : status === 'generating' ? (
                        <Button variant="ghost" size="sm" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </Button>
                    ) : (
                        <span className="text-muted-foreground text-sm">Unavailable</span>
                    )}
                </div>
            );
        },
    },
];

export function AnalyticsReportsList({ reports, onGenerateReport }: AnalyticsReportsListProps) {
    const facets = [
        {
            columnKey: 'type',
            title: 'Type',
            options: [
                { label: 'Completion', value: 'completion' },
                { label: 'Incident', value: 'incident' },
                { label: 'Performance', value: 'performance' },
            ],
        },
        {
            columnKey: 'status',
            title: 'Status',
            options: [
                { label: 'Ready', value: 'ready' },
                { label: 'Generating', value: 'generating' },
                { label: 'Failed', value: 'failed' },
            ],
        },
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>
                        Download administrative reports on system usage and exam integrity.
                    </CardDescription>
                </div>
                <Button
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    onClick={() => {
                        if (onGenerateReport) {
                            onGenerateReport({
                                title: `Administrative Telemetry Report - ${new Date().toLocaleDateString()}`,
                                type: 'incident',
                                format: 'pdf',
                            });
                        }
                    }}
                >
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Generate New Report
                </Button>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={reports} searchKey="title" facets={facets} />
            </CardContent>
        </Card>
    );
}
