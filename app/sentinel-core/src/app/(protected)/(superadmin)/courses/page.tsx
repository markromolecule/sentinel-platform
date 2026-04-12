'use client';

import { isPermissionDeniedError, useCoursesQuery, useDebounce } from '@sentinel/hooks';
import { useState } from 'react';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { AddCourseDialog, CourseList } from '@/app/(protected)/(superadmin)/courses/_components';

export default function AdminCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: courses = [], isLoading, isError, error } = useCoursesQuery(debouncedSearch);
    const isCourseViewDenied = isPermissionDeniedError(error, 'courses:view');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Course Management"
                description="Manage academic programs and courses."
            >
                {!isCourseViewDenied ? <AddCourseDialog /> : null}
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
