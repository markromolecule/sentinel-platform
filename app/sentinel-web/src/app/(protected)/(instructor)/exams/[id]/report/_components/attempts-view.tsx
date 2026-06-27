import * as React from 'react';
import type { ExamReport } from '@sentinel/shared/types';
import { DataTable, FacetedFilter } from '@sentinel/ui';
import type { ColumnDef } from '@tanstack/react-table';

type AttemptsViewProps = {
    report: ExamReport;
    columns: ColumnDef<any>[];
    searchValue: string;
    setSearchValue: (v: string) => void;
    sectionFilter: string | undefined;
    setSectionFilter: (v: string | undefined) => void;
    sectionOptions: (readonly [string, string])[];
    studentPage: number;
    setStudentPage: (page: number) => void;
    pageSize: number;
};

/**
 * Renders the Attempt Summary View containing:
 * - A descriptive header
 * - The primary Attempts DataTable (with custom search handler, manual pagination,
 *   column visibility defaults, and a section FacetedFilter inside the toolbar actions).
 */
export function AttemptsView({
    report,
    columns,
    searchValue,
    setSearchValue,
    sectionFilter,
    setSectionFilter,
    sectionOptions,
    studentPage,
    setStudentPage,
    pageSize,
}: AttemptsViewProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Attempt Summary Report</h2>
                    <p className="text-muted-foreground text-sm">
                        Absentees stay in the list so instructors can manage makeup and
                        retake workflows in one place.
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={report.students}
                searchKey="name"
                searchPlaceholder="Search student..."
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                manualPagination
                pageCount={Math.max(report.studentsPagination.totalPages, 1)}
                totalCount={report.studentsPagination.total}
                pagination={{
                    pageIndex: studentPage - 1,
                    pageSize,
                }}
                onPaginationChange={(state) => setStudentPage(state.pageIndex + 1)}
                initialColumnVisibility={{ startedAt: false }}
                toolbarActions={
                    <FacetedFilter
                        title="Section"
                        options={sectionOptions.map(([id, name]) => ({
                            label: name,
                            value: id,
                        }))}
                        selectedValues={sectionFilter ? new Set([sectionFilter]) : new Set()}
                        onSelect={(val) => {
                            setSectionFilter(sectionFilter === val ? undefined : val);
                        }}
                        onClear={() => setSectionFilter(undefined)}
                    />
                }
            />
        </div>
    );
}
