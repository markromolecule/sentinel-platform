import * as React from 'react';
import { useState, useMemo } from 'react';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import { Badge, DataTable, FacetedFilter } from '@sentinel/ui';
import { getActionQueueColumns } from './action-queue-columns';
import { paginateItems } from './helpers';

type ActionQueuePanelProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    items: ExamReportActionItem[];
    actionLabel?: string;
    onAction?: (item: ExamReportActionItem) => void;
    activeActionId?: string | null;
    page: number;
    onPageChange: (page: number) => void;
    examId: string;
    sectionOptions: readonly (readonly [string, string])[];
};

/**
 * Renders an Action Queue sub-section table (Needs Review, Needs Makeup, Needs Retake).
 * Features a local search bar, a section faceted filter, client-side pagination, and column actions.
 */
export function ActionQueuePanel({
    title,
    description,
    icon,
    items,
    actionLabel,
    onAction,
    activeActionId,
    page,
    onPageChange,
    examId,
    sectionOptions,
}: ActionQueuePanelProps) {
    const [searchValue, setSearchValue] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string | undefined>(undefined);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                !searchValue ||
                `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.studentNo.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchValue.toLowerCase());

            const matchesSection = !sectionFilter || item.sectionId === sectionFilter;

            return matchesSearch && matchesSection;
        });
    }, [items, searchValue, sectionFilter]);

    const paginated = paginateItems(filteredItems, page, 8);
    const columns = getActionQueueColumns({ actionLabel, onAction, activeActionId, examId });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <Badge variant="secondary">{items.length}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-sm">
                    No students in this queue right now.
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={paginated.items}
                    manualPagination
                    pageCount={paginated.pagination.totalPages}
                    totalCount={paginated.pagination.total}
                    pagination={{
                        pageIndex: paginated.pagination.page - 1,
                        pageSize: paginated.pagination.pageSize,
                    }}
                    onPaginationChange={(state) => onPageChange(state.pageIndex + 1)}
                    searchKey="name"
                    searchPlaceholder="Search student..."
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    toolbarActions={
                        <FacetedFilter
                            title="Section"
                            options={sectionOptions.map(([id, name]) => ({
                                label: name,
                                value: id,
                            }))}
                            selectedValues={sectionFilter ? new Set([sectionFilter]) : new Set()}
                            onSelect={(val) => {
                                setSectionFilter((current) => (current === val ? undefined : val));
                            }}
                            onClear={() => setSectionFilter(undefined)}
                        />
                    }
                />
            )}
        </div>
    );
}
