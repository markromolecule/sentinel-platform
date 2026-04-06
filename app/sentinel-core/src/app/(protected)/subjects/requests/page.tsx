'use client';

import {
    useEnrollmentRequestsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useSectionsQuery,
} from '@sentinel/hooks';
import { PageHeader, Separator } from '@sentinel/ui';
import { EnrollmentRequestsList } from '@/app/(protected)/(admin)/subjects/requests/_components/enrollment-requests-list';

export default function SharedEnrollmentRequestsPage() {
    const { data: requests = [], isLoading, isError } = useEnrollmentRequestsQuery();
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: sections = [] } = useSectionsQuery();

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Enrollment Requests"
                description="Review and process instructor offered-subject enrollment requests."
            />
            <Separator />

            <div className="relative">
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : isError ? (
                    <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                        Error loading enrollment requests.
                    </div>
                ) : (
                    <EnrollmentRequestsList
                        requests={requests}
                        departments={departments}
                        courses={courses}
                        sections={sections}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}
