'use client';

import {
    useDebounce,
    useDepartmentsQuery,
    isPermissionDeniedError,
    useServerPagination,
    useActivePermissions,
} from '@sentinel/hooks';
import { useState } from 'react';
import {
    AddDepartmentDialog,
    BulkCreateDepartmentsDialog,
    DepartmentsList,
} from '@/app/(protected)/(support)/departments/_components';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';

export default function SupportDepartmentsPage() {
    const { hasPermission } = useActivePermissions();
    const canCreateDepartment = hasPermission('departments:create');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { pagination, setPagination } = useServerPagination([debouncedSearch]);

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

    const departments = departmentsResponse?.items ?? [];
    const pageCount = departmentsResponse?.pagination?.totalPages ?? 1;
    const totalCount = departmentsResponse?.pagination?.total ?? 0;

    const isViewDenied = isPermissionDeniedError(error, 'departments:view');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Department Management"
                description="Manage academic departments and codes."
            >
                {!isViewDenied ? (
                    <div className="flex items-center gap-2">
                        {canCreateDepartment ? (
                            <BulkCreateDepartmentsDialog
                                defaultInstitutionId={selectedInstitutionId}
                            />
                        ) : null}
                        {canCreateDepartment ? (
                            <AddDepartmentDialog defaultInstitutionId={selectedInstitutionId} />
                        ) : null}
                    </div>
                ) : null}
            </PageHeader>
            <Separator />

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
                        manualPagination={true}
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
        </div>
    );
}
