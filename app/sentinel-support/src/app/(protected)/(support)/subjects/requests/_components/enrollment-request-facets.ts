'use client';

import { type DataTableFacet } from '@sentinel/ui';

type EnrollmentRequestFacetsArgs = {
    departments: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; title: string }>;
    sections: Array<{ id: string; name: string }>;
};

/**
 * Builds the faceted filters for the enrollment requests DataTable.
 */
export function buildEnrollmentRequestFacets({
    departments,
    courses,
    sections,
}: EnrollmentRequestFacetsArgs): DataTableFacet[] {
    return [
        {
            columnKey: 'status',
            title: 'Status',
            options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
            ],
        },
        {
            columnKey: 'department_id',
            title: 'Department',
            options: departments.map((department) => ({
                label: department.name,
                value: department.id,
            })),
        },
        {
            columnKey: 'course_id',
            title: 'Course',
            options: courses.map((course) => ({
                label: course.title,
                value: course.id,
            })),
        },
        {
            columnKey: 'section_id',
            title: 'Section',
            options: sections.map((section) => ({
                label: section.name,
                value: section.id,
            })),
        },
    ];
}
