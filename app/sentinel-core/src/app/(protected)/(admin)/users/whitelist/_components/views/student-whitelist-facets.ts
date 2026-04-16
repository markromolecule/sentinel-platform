'use client';

import { type DataTableFacet } from '@sentinel/ui';

type StudentWhitelistFacetsArgs = {
    institutions: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; code?: string | null }>;
    courses: Array<{ id: string; title: string; code?: string | null }>;
};

export function buildStudentWhitelistFacets({
    institutions,
    departments,
    courses,
}: StudentWhitelistFacetsArgs): DataTableFacet[] {
    return [
        {
            columnKey: 'institutionId',
            title: 'Institution',
            options: institutions.map((institution) => ({
                label: institution.name,
                value: institution.id,
            })),
        },
        {
            columnKey: 'status',
            title: 'Status',
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
                { label: 'Archived', value: 'ARCHIVED' },
            ],
        },
        {
            columnKey: 'claimStatus',
            title: 'Claim Status',
            options: [
                { label: 'Claimed', value: 'CLAIMED' },
                { label: 'Unclaimed', value: 'UNCLAIMED' },
            ],
        },
        {
            columnKey: 'departmentId',
            title: 'Department',
            options: departments.map((department) => ({
                label: department.code || department.name,
                value: department.id,
            })),
        },
        {
            columnKey: 'courseId',
            title: 'Course',
            options: courses.map((course) => ({
                label: course.code || course.title,
                value: course.id,
            })),
        },
    ];
}
