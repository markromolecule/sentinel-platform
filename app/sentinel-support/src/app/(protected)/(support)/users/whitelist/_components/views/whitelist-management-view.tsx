import { useState, useMemo, useLayoutEffect, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ColumnFiltersState, type PaginationState } from '@tanstack/react-table';
import {
    useDebounce,
    useInstitutionsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useStableValue,
    useStudentWhitelistQuery,
} from '@sentinel/hooks';
import { PageHeader, Separator } from '@sentinel/ui';
import { useInstitutionFacet, useDataTableFilterSync } from '@/hooks';
import { WhitelistList } from './whitelist-list';
import { buildStudentWhitelistFacets } from './whitelist-facets';
import { AddStudentWhitelistDialog } from '../dialogs/add-student-whitelist-dialog';
import { BulkImportStudentWhitelistDialog } from '../dialogs/bulk-import-student-whitelist-dialog';

/**
 * WhitelistManagementView acts as the core view for whitelist record orchestration.
 * It manages search query state, integrates table facets with backend selectors,
 * performs dependent filter cleanups, and hosts add/bulk import dialog triggers.
 */
export function WhitelistManagementView({
    insideShell,
    setActions,
}: {
    insideShell?: boolean;
    setActions?: (actions: React.ReactNode) => void;
}) {
    const [search, setSearch] = useState('');
    useLayoutEffect(() => {
        if (insideShell) {
            setActions?.(
                <div className="flex items-center gap-2">
                    <AddStudentWhitelistDialog triggerLabel="Add Whitelist" />
                    <BulkImportStudentWhitelistDialog />
                </div>,
            );
            return () => setActions?.(null);
        }
    }, [insideShell, setActions]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>(
        undefined,
    );
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(undefined);
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        setPagination((current) =>
            current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
        );
    }, [debouncedSearch, selectedInstitutionId, selectedDepartmentId, selectedCourseId]);

    const { data: institutions = [] } = useInstitutionsQuery();

    const departmentsParams = useStableValue(
        () => ({
            institutionId: selectedInstitutionId,
            enabled: Boolean(selectedInstitutionId),
        }),
        [selectedInstitutionId],
    );

    const { data: departments = [] } = useDepartmentsQuery(departmentsParams);

    const coursesParams = useStableValue(
        () => ({
            institutionId: selectedInstitutionId,
            departmentId: selectedDepartmentId,
            enabled: Boolean(selectedInstitutionId),
        }),
        [selectedInstitutionId, selectedDepartmentId],
    );

    const { data: courses = [] } = useCoursesQuery(coursesParams);

    const whitelistParams = useStableValue(
        () => ({
            search: debouncedSearch || undefined,
            institution_id: selectedInstitutionId,
            department_id: selectedDepartmentId,
            course_id: selectedCourseId,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
        }),
        [
            debouncedSearch,
            selectedInstitutionId,
            selectedDepartmentId,
            selectedCourseId,
            pagination,
        ],
    );

    const { data: recordsResponse, isLoading, error } = useStudentWhitelistQuery(whitelistParams);

    const records = recordsResponse?.items ?? [];
    const totalCount = recordsResponse?.pagination?.total ?? 0;
    const pageCount = recordsResponse?.pagination
        ? Math.max(1, Math.ceil(totalCount / pagination.pageSize))
        : 1;

    const institutionFacetOptions = useInstitutionFacet({ institutions });

    useDataTableFilterSync({
        columnFilters,
        syncKeys: ['institutionId', 'departmentId', 'courseId', 'status', 'claimStatus'],
        onFilterChange: (key, value) => {
            if (key === 'institutionId') {
                setSelectedInstitutionId(value);
                setSelectedDepartmentId(undefined);
                setSelectedCourseId(undefined);
                setColumnFilters((prev) =>
                    prev.filter((f) => f.id !== 'departmentId' && f.id !== 'courseId'),
                );
            } else if (key === 'departmentId') {
                setSelectedDepartmentId(value);
                setSelectedCourseId(undefined);
                setColumnFilters((prev) => prev.filter((f) => f.id !== 'courseId'));
            } else if (key === 'courseId') {
                setSelectedCourseId(value);
            }
        },
    });

    const facets = useMemo(
        () =>
            buildStudentWhitelistFacets({
                institutions,
                departments,
                courses,
                institutionFacetOptions,
            }),
        [institutions, departments, courses, institutionFacetOptions],
    );

    const content = error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
            <p className="text-destructive font-medium">Failed to load whitelist records.</p>
            <p className="text-muted-foreground text-sm">
                Please check your permissions and try again.
            </p>
        </div>
    ) : (
        <div className="relative">
            <WhitelistList
                records={records}
                search={search}
                onSearchChange={setSearch}
                isLoading={isLoading}
                facets={facets}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={pageCount}
                totalCount={totalCount}
            />

            {isLoading && (
                <div className="bg-background/50 absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-[1px]">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            )}
        </div>
    );

    if (insideShell) {
        return content;
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Support Whitelist Management"
                description="Manage approved student identities with global administrative access."
            >
                <div className="flex items-center gap-2">
                    <AddStudentWhitelistDialog triggerLabel="Add Whitelist" />
                    <BulkImportStudentWhitelistDialog />
                </div>
            </PageHeader>

            <Separator />
            {content}
        </div>
    );
}
