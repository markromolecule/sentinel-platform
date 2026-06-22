'use client';

import {
    useDebounce,
    useSemestersQuery,
    isPermissionDeniedError,
    useServerPagination,
} from '@sentinel/hooks';
import { useState } from 'react';
import {
    AddSemesterDialog,
    SemestersList,
} from '@/app/(protected)/(support)/semesters/_components';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';

export default function SupportSemestersPage() {
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

    const semesters = semestersResponse?.items ?? [];
    const pageCount = semestersResponse?.pagination?.totalPages ?? 1;
    const totalCount = semestersResponse?.pagination?.total ?? 0;

    const isViewDenied = isPermissionDeniedError(error, 'semesters:view');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Term Management"
                description="Manage academic semesters, terms, and their schedules."
            >
                {!isViewDenied ? <AddSemesterDialog /> : null}
            </PageHeader>
            <Separator />

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
                        manualPagination={true}
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
        </div>
    );
}
