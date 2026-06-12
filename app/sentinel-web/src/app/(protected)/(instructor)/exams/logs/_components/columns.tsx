'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Laptop, Smartphone, AlertTriangle } from 'lucide-react';
import { Checkbox, Badge, Button, DataTableColumnHeader } from '@sentinel/ui';
import { type ApiIncidentLogItem } from '@sentinel/services';
import { flagLabels } from '@sentinel/shared/constants';

function getSeverityBadgeStyles(severity: ApiIncidentLogItem['severity']) {
    switch (severity) {
        case 'HIGH':
            return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
        case 'MEDIUM':
            return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
        case 'LOW':
        default:
            return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
    }
}

function getStatusBadgeStyles(status: ApiIncidentLogItem['status']) {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
        case 'DISMISSED':
            return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800';
        case 'PENDING':
        default:
            return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900';
    }
}

function formatElapsedTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const columns: ColumnDef<ApiIncidentLogItem>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div onClick={(e) => e.stopPropagation()} className="w-12 text-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div onClick={(e) => e.stopPropagation()} className="w-12 text-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'severity',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Severity" />,
        cell: ({ row }) => {
            const severity = row.getValue('severity') as ApiIncidentLogItem['severity'];
            return (
                <Badge
                    variant="outline"
                    className={`${getSeverityBadgeStyles(
                        severity,
                    )} px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase`}
                >
                    {severity}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => {
            const incident = row.original;
            return (
                <div className="max-w-[200px]">
                    <div className="text-foreground truncate text-sm font-semibold">
                        {incident.studentName || 'Unknown Student'}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                        {incident.studentNo || 'No ID'}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'sectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
        cell: ({ row }) => (
            <div className="max-w-[140px] truncate text-sm">
                {row.getValue('sectionName') || 'Unassigned'}
            </div>
        ),
    },
    {
        accessorKey: 'incidentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Incident Type" />,
        cell: ({ row }) => {
            const incident = row.original;

            if (incident.details?._isGrouped) {
                const uniqueTypes = Array.from(
                    new Set(
                        incident.details._incidents.map(
                            (i: any) =>
                                flagLabels[i.incidentType as keyof typeof flagLabels] ||
                                i.incidentType.replaceAll('_', ' '),
                        ),
                    ),
                ) as string[];

                return (
                    <div className="max-w-[240px]">
                        <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                            {incident.severity === 'HIGH' && (
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                            )}
                            <span className="text-primary truncate">
                                {incident.details._incidentCount}{' '}
                                {incident.details._incidentCount === 1 ? 'alert' : 'alerts'}
                            </span>
                        </div>
                        <div
                            className="text-muted-foreground truncate text-[10px] uppercase"
                            title={uniqueTypes.join(', ')}
                        >
                            {uniqueTypes.join(', ')}
                        </div>
                    </div>
                );
            }

            return (
                <div className="max-w-[240px]">
                    <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                        {incident.severity === 'HIGH' && (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                        )}
                        <span className="truncate">
                            {flagLabels[incident.incidentType as keyof typeof flagLabels] ||
                                incident.incidentType.replaceAll('_', ' ')}
                        </span>
                    </div>
                    {incident.ruleKey && (
                        <div className="text-muted-foreground truncate font-mono text-[10px] uppercase">
                            {incident.ruleKey}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'platform',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
        cell: ({ row }) => {
            const incident = row.original;
            return (
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    {incident.platform === 'MOBILE' ? (
                        <Smartphone className="h-3.5 w-3.5" />
                    ) : (
                        <Laptop className="h-3.5 w-3.5" />
                    )}
                    <span>
                        {incident.platform || 'WEB'}
                        <span className="bg-muted ml-1 rounded px-1.5 py-0.5 text-[9px] uppercase">
                            {incident.source || 'CLIENT'}
                        </span>
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'elapsedSeconds',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Timeline" />,
        cell: ({ row }) => {
            const incident = row.original;
            return (
                <div>
                    <div className="text-foreground text-sm font-semibold">
                        {formatElapsedTime(incident.elapsedSeconds)}
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                        {incident.timestamp
                            ? new Date(incident.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : 'N/A'}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as ApiIncidentLogItem['status'];
            return (
                <Badge
                    variant="outline"
                    className={`${getStatusBadgeStyles(
                        status,
                    )} px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase`}
                >
                    {status === 'PENDING' ? 'Needs Review' : status}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row, table }) => {
            const meta = table.options.meta as
                | {
                      onSelectIncident?: (incident: ApiIncidentLogItem) => void;
                  }
                | undefined;
            return (
                <div className="w-20 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100"
                        onClick={() => meta?.onSelectIncident?.(row.original)}
                    >
                        <Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
