'use client';

import React, { useEffect, useRef } from 'react';
import { CheckCircle, ListFilter, Users } from 'lucide-react';
import { DataTable, Button, cn } from '@sentinel/ui';
import { type ApiIncidentLogItem } from '@sentinel/services';
import { flagLabels } from '@sentinel/shared/constants';
import { columns } from './columns';

interface IncidentTableProps {
    incidents: ApiIncidentLogItem[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onSelectIncident: (incident: ApiIncidentLogItem) => void;
    hasMore: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    columnFilters: any;
    onColumnFiltersChange: (filters: any) => void;
    sections: { id: string; name: string }[];
    groupMode: 'logs' | 'student';
    onGroupModeChange: (mode: 'logs' | 'student') => void;
    isLoading?: boolean;
}

export function IncidentTable({
    incidents,
    selectedIds,
    onSelectionChange,
    onSelectIncident,
    hasMore,
    isFetchingNextPage,
    onLoadMore,
    searchValue,
    onSearchChange,
    columnFilters,
    onColumnFiltersChange,
    sections,
    groupMode,
    onGroupModeChange,
    isLoading,
}: IncidentTableProps) {
    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const target = observerTargetRef.current;
        if (!target || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !isFetchingNextPage) {
                    onLoadMore();
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
    }, [hasMore, isFetchingNextPage, onLoadMore]);

    // Map flat selectedIds (strings) from parent to index-based rowSelection for DataTable
    const rowSelection = React.useMemo(() => {
        const selection: Record<string, boolean> = {};
        incidents.forEach((incident, index) => {
            if (selectedIds.includes(incident.incidentId)) {
                selection[index] = true;
            }
        });
        return selection;
    }, [incidents, selectedIds]);

    // Intercept row selection changes and update page-level selectedIds
    const handleRowSelectionChange = (updaterOrValue: any) => {
        const nextSelection =
            typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;

        const nextSelectedIds = Object.entries(nextSelection)
            .filter(([, isSelected]) => Boolean(isSelected))
            .map(([index]) => incidents[Number(index)]?.incidentId)
            .filter((id): id is string => Boolean(id));

        onSelectionChange(nextSelectedIds);
    };

    // Calculate Dynamic Left Border based on severity
    const getRowClassName = (incident: ApiIncidentLogItem) => {
        const severityBorder =
            incident.severity === 'HIGH'
                ? 'border-l-4 border-l-red-500'
                : incident.severity === 'MEDIUM'
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-blue-500';
        return `${severityBorder} group hover:bg-muted/40 transition-colors`;
    };

    // Configure facets for Section, Severity, Incident Type, and Status
    const facets = React.useMemo(() => {
        const sectionOptions = sections.map((s) => ({
            label: s.name,
            value: s.id,
        }));

        return [
            {
                columnKey: 'sectionName',
                title: 'Section',
                options: sectionOptions,
            },
            {
                columnKey: 'severity',
                title: 'Severity',
                options: [
                    { label: 'High', value: 'HIGH' },
                    { label: 'Medium', value: 'MEDIUM' },
                    { label: 'Low', value: 'LOW' },
                ],
            },
            {
                columnKey: 'incidentType',
                title: 'Incident Type',
                options: Object.entries(flagLabels).map(([key, label]) => ({
                    label,
                    value: key,
                })),
            },
            {
                columnKey: 'status',
                title: 'Status',
                options: [
                    { label: 'Needs Review', value: 'PENDING' },
                    { label: 'Confirmed', value: 'CONFIRMED' },
                    { label: 'Dismissed', value: 'DISMISSED' },
                ],
            },
        ];
    }, [sections]);

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-semibold">No incidents found</p>
            <p className="text-xs">All proctoring logs match clean telemetry constraints.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={incidents}
                onRowClick={onSelectIncident}
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                rowClassName={getRowClassName}
                emptyContent={emptyContent}
                manualPagination={true}
                isLoading={isLoading}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                columnFilters={columnFilters}
                onColumnFiltersChange={onColumnFiltersChange}
                facets={facets}
                meta={{
                    onSelectIncident,
                }}
                toolbarActions={
                    <Button
                        variant="outline"
                        onClick={() =>
                            onGroupModeChange(groupMode === 'student' ? 'logs' : 'student')
                        }
                        className={cn(
                            'h-9 gap-2 border-slate-200 text-xs dark:border-slate-800',
                            groupMode === 'student' &&
                                'bg-[#323d8f] text-white hover:bg-[#323d8f]/90 hover:text-white',
                        )}
                    >
                        {groupMode === 'student' ? (
                            <Users className="h-3.5 w-3.5" />
                        ) : (
                            <ListFilter className="h-3.5 w-3.5" />
                        )}
                        <span>{groupMode === 'student' ? 'Grouped by Student' : 'All Logs'}</span>
                    </Button>
                }
            />

            {hasMore && (
                <div
                    ref={observerTargetRef}
                    className="text-muted-foreground flex items-center justify-center py-4 text-xs font-semibold"
                >
                    {isFetchingNextPage ? 'Loading more incidents...' : 'Scroll down to load more'}
                </div>
            )}
        </div>
    );
}
