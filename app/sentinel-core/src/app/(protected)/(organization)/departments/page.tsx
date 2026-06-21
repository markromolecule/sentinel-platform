'use client';

import {
    useDebounce,
    useDepartmentsQuery,
    isPermissionDeniedError,
    useActivePermissions,
    useServerPagination,
} from '@sentinel/hooks';
import { useState } from 'react';
import { AddDepartmentDialog, BulkCreateDepartmentsDialog, DepartmentsList } from './_components';
import { PermissionDeniedState } from '@sentinel/ui';
import { OrganizationPageShell } from '../_components/layout';

export default function CoreDepartmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { pagination, setPagination } = useServerPagination([debouncedSearch, selectedInstitutionId]);

    const { hasPermission } = useActivePermissions();
    const canImportDepartments = hasPermission('departments:import');
    const canCreateDepartment = hasPermission('departments:create');

    const {
        data: departmentsResponse,
        isLoading,
        isError,
        error,
    } = useDepartmentsQuery({
        search: debouncedSearch,
        institutionId: selectedInstitutionId || undefined,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });
    const isViewDenied = isPermissionDeniedError(error, 'departments:view');
    const departments = Array.isArray(departmentsResponse)
        ? departmentsResponse
        : departmentsResponse?.items ?? [];
    const totalCount = Array.isArray(departmentsResponse)
        ? departmentsResponse.length
        : departmentsResponse?.pagination?.total ?? 0;
    const pageCount = Array.isArray(departmentsResponse)
        ? 1
        : departmentsResponse?.pagination?.totalPages ?? 1;


    const actions = !isViewDenied ? (
        <div className="flex items-center gap-2">
            {canImportDepartments && (
                <BulkCreateDepartmentsDialog defaultInstitutionId={selectedInstitutionId} />
            )}
            {canCreateDepartment && (
                <AddDepartmentDialog defaultInstitutionId={selectedInstitutionId} />
            )}
        </div>
    ) : undefined;

    return (
        <OrganizationPageShell
            title="Department Management"
            description="Manage academic departments and codes."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="departments" className="h-[360px]" />
            ) : (
                <div className="relative flex flex-col gap-4">
                    <DepartmentsList
                        departments={departments}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        selectedInstitutionId={selectedInstitutionId}
                        onInstitutionChange={setSelectedInstitutionId}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        totalCount={totalCount}
                        manualPagination
                    />
                    {isLoading && departments.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading departments. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </OrganizationPageShell>
    );
}
