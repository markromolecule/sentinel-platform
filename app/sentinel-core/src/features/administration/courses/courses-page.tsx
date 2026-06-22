'use client';

import {
    isPermissionDeniedError,
    useActivePermissions,
    useCoursesQuery,
    useDebounce,
    useServerPagination,
} from '@sentinel/hooks';
import { useState } from 'react';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { AddCourseDialog, CourseList } from './_components';
import { useAcademicScope } from '@/hooks/use-academic-scope';

/**
 * Shared, capability-driven CoursesPage component.
 * Integrates useAcademicScope to restrict action-level operations dynamically.
 */
export function CoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { pagination, setPagination } = useServerPagination([debouncedSearch]);
    const { isReadOnlyFor } = useAcademicScope();
    const { hasPermission } = useActivePermissions();

    const {
        data: coursesResponse,
        isLoading,
        isError,
        error,
    } = useCoursesQuery({
        search: debouncedSearch,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });
    const isCourseViewDenied = isPermissionDeniedError(error, 'courses:view');
    const isCoursesReadOnly = isReadOnlyFor('courses');
    const canCreateCourse = hasPermission('courses:create') && !isCoursesReadOnly;
    const courses = Array.isArray(coursesResponse)
        ? coursesResponse
        : (coursesResponse?.items ?? []);
    const totalCount = Array.isArray(coursesResponse)
        ? coursesResponse.length
        : (coursesResponse?.pagination?.total ?? 0);
    const pageCount = Array.isArray(coursesResponse)
        ? 1
        : (coursesResponse?.pagination?.totalPages ?? 1);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Program Management"
                description="Manage academic programs and courses."
            >
                {!isCourseViewDenied && canCreateCourse ? <AddCourseDialog /> : null}
            </PageHeader>
            <Separator />

            {isCourseViewDenied ? (
                <PermissionDeniedState resourceName="courses" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <CourseList
                        courses={courses}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        totalCount={totalCount}
                        manualPagination
                    />

                    {isLoading && courses.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading courses. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
