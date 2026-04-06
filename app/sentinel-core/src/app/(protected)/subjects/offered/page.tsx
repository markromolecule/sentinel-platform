'use client';

import { useDebounce, useCoursesQuery, useDepartmentsQuery, useSectionsQuery, useSubjectOfferingsQuery } from '@sentinel/hooks';
import { useMemo, useState } from 'react';
import {
    createSubjectOfferingColumns,
    OfferSubjectDialog,
    OfferedSubjectsList,
} from '@/app/(protected)/(admin)/subjects/_components';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { Plus } from 'lucide-react';

function buildLabelMap<T extends { id: string }>(
    items: T[],
    getLabel: (item: T) => string,
) {
    return new Map(items.map((item) => [item.id, getLabel(item)]));
}

export default function SharedOfferedSubjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [offerSubjectOpen, setOfferSubjectOpen] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: offerings = [], isLoading, isError } = useSubjectOfferingsQuery({
        search: debouncedSearch,
    });
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: sections = [] } = useSectionsQuery();

    const departmentLabelMap = useMemo(
        () =>
            buildLabelMap(
                departments,
                (department) => department.code?.trim() || department.name,
            ),
        [departments],
    );
    const courseLabelMap = useMemo(
        () =>
            buildLabelMap(courses, (course) => course.code?.trim() || course.title),
        [courses],
    );
    const sectionLabelMap = useMemo(
        () => buildLabelMap(sections, (section) => section.name),
        [sections],
    );

    const columns = useMemo(
        () =>
            createSubjectOfferingColumns({
                departmentLabelMap,
                courseLabelMap,
                sectionLabelMap,
            }),
        [courseLabelMap, departmentLabelMap, sectionLabelMap],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Offered Subjects"
                description="Review all term-based subject offerings and the audiences they are assigned to."
            >
                <Button
                    onClick={() => setOfferSubjectOpen(true)}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Offer Subject
                </Button>
            </PageHeader>
            <Separator />

            <div className="relative">
                <OfferedSubjectsList
                    offerings={offerings}
                    columns={columns}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                />

                {isError && (
                    <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                        Error loading offered subjects. Please try again.
                    </div>
                )}
            </div>

            <OfferSubjectDialog
                open={offerSubjectOpen}
                onOpenChange={setOfferSubjectOpen}
            />
        </div>
    );
}
