'use client';

import {
    findPermissionDeniedError,
    useEnrollmentRequestsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useSectionsQuery,
} from '@sentinel/hooks';
import { PermissionDeniedState } from '@sentinel/ui';
import { EnrollmentRequestsList } from '../_components/requests/enrollment-requests-list';
import { SubjectPageShell } from '../_components/layout';

/**
 * SharedEnrollmentRequestsPage renders the enrollment requests page for sentinel-core,
 * wrapped in the SubjectPageShell layout.
 */
export default function SharedEnrollmentRequestsPage() {
    const {
        data: requests = [],
        isLoading,
        isError,
        error: requestsError,
    } = useEnrollmentRequestsQuery();
    const { data: departments = [], error: departmentsError } = useDepartmentsQuery();
    const { data: courses = [], error: coursesError } = useCoursesQuery();
    const { data: sections = [], error: sectionsError } = useSectionsQuery();
    const deniedError = findPermissionDeniedError([
        requestsError,
        departmentsError,
        coursesError,
        sectionsError,
    ]);
    const isViewDenied = Boolean(deniedError);

    return (
        <SubjectPageShell
            title="Enrollment Requests"
            description="Review and process instructor offered-subject enrollment requests."
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="subject requests" className="h-[360px]" />
            ) : (
                <div className="relative">
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    ) : isError ? (
                        <div className="border-destructive/20 bg-destructive/5 text-destructive mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading enrollment requests. Contact support if this continues.
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
            )}
        </SubjectPageShell>
    );
}

