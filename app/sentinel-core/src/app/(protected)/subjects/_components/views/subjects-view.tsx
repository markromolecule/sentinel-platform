'use client';

import { useState } from 'react';
import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useStableValue,
    useSubjectsQuery,
    useServerPagination,
} from '@sentinel/hooks';
import {
    createMasterColumns,
    OfferSubjectDialog,
    SubjectsList,
} from '@/app/(protected)/subjects/_components';
import { PermissionDeniedState } from '@sentinel/ui';
import { useAcademicScope } from '@/hooks/use-academic-scope';

/**
 * SubjectsView renders the master subject catalog table, including search, facets,
 * loading overlay, and error states.
 */
export function SubjectsView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [offerSubjectOpen, setOfferSubjectOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { role, institutionId } = useAcademicScope();
    const { hasPermission } = useActivePermissions();
    const { pagination, setPagination } = useServerPagination([debouncedSearch, institutionId]);

    const isCatalogManager = role === 'superadmin' || role === 'admin';
    const canCreateSubject = hasPermission('subjects:create');
    const canDeleteSubjects = hasPermission('subjects:delete');
    const canOfferSubject = hasPermission('subject_offerings:offer');
    const canBulkDeleteSubjects = isCatalogManager && canDeleteSubjects;

    const {
        data: subjectsResponse,
        isLoading,
        isError,
        error,
    } = useSubjectsQuery({
        search: debouncedSearch || undefined,
        institutionId: institutionId || undefined,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });

    const subjects = subjectsResponse?.items ?? [];
    const totalCount = subjectsResponse?.pagination?.total ?? 0;
    const pageCount = subjectsResponse?.pagination
        ? Math.max(1, Math.ceil(totalCount / pagination.pageSize))
        : 1;

    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');

    const columns = useStableValue(
        () => createMasterColumns({ canManageCatalog: canBulkDeleteSubjects }),
        [canBulkDeleteSubjects],
    );

    const facets = useStableValue(
        () => [
            {
                columnKey: 'inheritanceStatus',
                title: 'Origin',
                options: [
                    { label: 'Local', value: 'LOCAL' },
                    { label: 'Inherited', value: 'INHERITED' },
                    { label: 'Overridden', value: 'OVERRIDDEN' },
                ],
            },
        ],
        [],
    );

    if (isViewDenied) {
        return <PermissionDeniedState resourceName="subjects" className="h-[360px]" />;
    }

    return (
        <div className="relative">
            <SubjectsList
                subjects={subjects}
                columns={columns}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isLoading={isLoading}
                canCreateSubjects={isCatalogManager && canCreateSubject}
                canDeleteSubjects={canBulkDeleteSubjects}
                facets={facets}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={pageCount}
                totalCount={totalCount}
                manualPagination
            />

            {isLoading && subjects.length === 0 && (
                <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                </div>
            )}

            {isError && (
                <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                    Error loading subjects. Contact support if this continues.
                </div>
            )}

            {canOfferSubject && (
                <OfferSubjectDialog open={offerSubjectOpen} onOpenChange={setOfferSubjectOpen} />
            )}
        </div>
    );
}
