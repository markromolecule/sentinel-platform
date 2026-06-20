'use client';

import { useEffect, useState } from 'react';
import {
    findPermissionDeniedError,
    useEnrollmentRequestsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useSectionsQuery,
    useInstitutionsQuery,
} from '@sentinel/hooks';
import { PermissionDeniedState } from '@sentinel/ui';
import { useAcademicScope } from '@/hooks';
import { SubjectPageShell } from '../_components/layout';
import { EnrollmentRequestsList } from './_components/enrollment-requests-list';

/**
 * SharedEnrollmentRequestsPage renders the enrollment requests page for sentinel-support.
 * It fetches the required data and handles loading, error, and permission-denied states,
 * wrapped in the SubjectPageShell layout.
 */
export default function SupportEnrollmentRequestsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>(
        undefined,
    );
    const [hasInitializedScope, setHasInitializedScope] = useState(false);

    useEffect(() => {
        if (!isScopeLoading && !hasInitializedScope) {
            if (institutionId) {
                setSelectedInstitutionId(institutionId);
            }
            setHasInitializedScope(true);
        }
    }, [institutionId, isScopeLoading, hasInitializedScope]);

    const {
        data: requests = [],
        isLoading: isRequestsLoading,
        isError,
        error: requestsError,
    } = useEnrollmentRequestsQuery(undefined, undefined, selectedInstitutionId);
    const { data: departments = [], error: departmentsError } = useDepartmentsQuery();
    const { data: courses = [], error: coursesError } = useCoursesQuery();
    const { data: sections = [], error: sectionsError } = useSectionsQuery();
    const { data: institutions = [], error: institutionsError } = useInstitutionsQuery();

    const isLoading = isRequestsLoading || !hasInitializedScope;

    const deniedError = findPermissionDeniedError([
        requestsError,
        departmentsError,
        coursesError,
        sectionsError,
        institutionsError,
    ]);
    const isViewDenied = Boolean(deniedError);

    return (
        <SubjectPageShell
            title="Enrollment Requests"
            description="Review and process instructor enrollment requests."
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
                            institutions={institutions}
                            selectedInstitutionId={selectedInstitutionId}
                            setSelectedInstitutionId={setSelectedInstitutionId}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            )}
        </SubjectPageShell>
    );
}
