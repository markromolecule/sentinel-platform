'use client';

import { useDebounce, useSemestersQuery, isPermissionDeniedError, useServerPagination } from '@sentinel/hooks';
import { useState } from 'react';
import { AddSemesterDialog, SemestersList } from './_components';
import { PermissionDeniedState } from '@sentinel/ui';
import { OrganizationPageShell } from '../_components/layout';

export default function CoreSemestersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { pagination, setPagination } = useServerPagination([debouncedSearch]);

    const {
        data: semestersResponse,
        isLoading,
        isError,
        error,
    } = useSemestersQuery({
        search: debouncedSearch,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });
    const isViewDenied = isPermissionDeniedError(error, 'semesters:view');
    const semesters = Array.isArray(semestersResponse)
        ? semestersResponse
        : semestersResponse?.items ?? [];
    const totalCount = Array.isArray(semestersResponse)
        ? semestersResponse.length
        : semestersResponse?.pagination?.total ?? 0;
    const pageCount = Array.isArray(semestersResponse)
        ? 1
        : semestersResponse?.pagination?.totalPages ?? 1;

    const actions = !isViewDenied ? <AddSemesterDialog /> : undefined;

    return (
        <OrganizationPageShell
            title="Semester Management"
            description="Manage academic semesters, terms, and their schedules."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="semesters" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <SemestersList
                        semesters={semesters}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        totalCount={totalCount}
                        manualPagination
                    />

                    {isLoading && semesters.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading semesters. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </OrganizationPageShell>
    );
}
