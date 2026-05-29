'use client';

import {
    findPermissionDeniedError,
    useActivePermissions,
    useCoursesQuery,
    useDebounce,
    useDepartmentsQuery,
    useSectionsQuery,
    useStableIdMap,
    useStableValue,
    useSubjectOfferingsQuery,
} from '@sentinel/hooks';
import { useState } from 'react';
import {
    createSubjectOfferingColumns,
    OfferSubjectDialog,
    OfferedSubjectsList,
} from '../_components';
import { Button, PermissionDeniedState } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { SubjectPageShell } from '../_components/layout';

/**
 * SharedOfferedSubjectsPage renders the offered subjects listing page for sentinel-core,
 * wrapped in the SubjectPageShell layout.
 */
export default function SharedOfferedSubjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [offerSubjectOpen, setOfferSubjectOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { hasPermission } = useActivePermissions();
    const canOfferSubject = hasPermission('subject_offerings:offer');

    const {
        data: offerings = [],
        isLoading,
        isError,
        error: offeringsError,
    } = useSubjectOfferingsQuery({
        search: debouncedSearch,
    });
    const { data: departments = [], error: departmentsError } = useDepartmentsQuery();
    const { data: courses = [], error: coursesError } = useCoursesQuery();
    const { data: sections = [], error: sectionsError } = useSectionsQuery();
    const deniedError = findPermissionDeniedError([
        offeringsError,
        departmentsError,
        coursesError,
        sectionsError,
    ]);
    const isViewDenied = Boolean(deniedError);

    const departmentLabelMap = useStableIdMap(
        departments,
        (department) => department.code?.trim() || department.name,
    );
    const courseLabelMap = useStableIdMap(courses, (course) => course.code?.trim() || course.title);
    const sectionLabelMap = useStableIdMap(sections, (section) => section.name);

    const canDeleteOfferings = hasPermission('subject_offerings:delete');

    const columns = useStableValue(
        () =>
            createSubjectOfferingColumns({
                departmentLabelMap,
                courseLabelMap,
                sectionLabelMap,
                canDeleteOfferings,
            }),
        [courseLabelMap, departmentLabelMap, sectionLabelMap, canDeleteOfferings],
    );

    const actions = (
        <div className="flex items-center gap-2">
            {!isViewDenied && canOfferSubject ? (
                <Button
                    onClick={() => setOfferSubjectOpen(true)}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Offer Subject
                </Button>
            ) : null}
        </div>
    );

    return (
        <SubjectPageShell
            title="Offered Subjects"
            description="Review all term-based subject offerings and the audiences they are assigned to."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="subject offerings" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <OfferedSubjectsList
                        offerings={offerings}
                        columns={columns}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        canDeleteOfferings={canDeleteOfferings}
                    />

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading offered subjects. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}

            {!isViewDenied && canOfferSubject ? (
                <OfferSubjectDialog open={offerSubjectOpen} onOpenChange={setOfferSubjectOpen} />
            ) : null}
        </SubjectPageShell>
    );
}
