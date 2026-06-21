'use client';

import {
    useDebounce,
    useSectionsQuery,
    isPermissionDeniedError,
    useActivePermissions,
    useServerPagination,
} from '@sentinel/hooks';
import { useState } from 'react';
import {
    AddSectionDialog,
    BulkCreateSectionsDialog,
    SectionsList,
} from '@/app/(protected)/sections/_components';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { PermissionGate } from '@/features/administration/shared/permission-gate';

export default function AdminSectionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { pagination, setPagination } = useServerPagination([debouncedSearch]);
    const { hasPermission } = useActivePermissions();

    const {
        data: sectionsResponse,
        isLoading,
        isError,
        error,
    } = useSectionsQuery({
        search: debouncedSearch,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });
    const isViewDenied = isPermissionDeniedError(error, 'sections:view');
    const sections = Array.isArray(sectionsResponse) ? sectionsResponse : sectionsResponse?.items ?? [];
    const totalCount = Array.isArray(sectionsResponse)
        ? sectionsResponse.length
        : sectionsResponse?.pagination?.total ?? 0;
    const pageCount = Array.isArray(sectionsResponse)
        ? 1
        : sectionsResponse?.pagination?.totalPages ?? 1;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Section Management"
                description="Manage academic sections and assign them to courses."
            >
                <PermissionGate permission={hasPermission('sections:create')}>
                    <div className="flex items-center gap-3">
                        <BulkCreateSectionsDialog />
                        <AddSectionDialog />
                    </div>
                </PermissionGate>
            </PageHeader>

            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="sections" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <SectionsList
                        sections={sections}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        totalCount={totalCount}
                        manualPagination
                    />

                    {isLoading && sections.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading sections. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
