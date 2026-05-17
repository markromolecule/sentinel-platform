import { Institution, Department, Course } from '@sentinel/shared/types';

interface BuildStudentWhitelistFacetsArgs {
    institutions: Institution[];
    departments: Department[];
    courses: Course[];
    institutionFacetOptions: { label: string; value: string }[];
}

/**
 * Builds the facet configuration array for the student whitelist DataTable.
 */
export function buildStudentWhitelistFacets({
    institutions,
    departments,
    courses,
    institutionFacetOptions,
}: BuildStudentWhitelistFacetsArgs) {
    return [
        {
            columnKey: 'institutionId',
            title: 'Institution',
            options: institutionFacetOptions,
        },
        {
            columnKey: 'departmentId',
            title: 'Department',
            options: departments.map((dept) => ({
                label: dept.code || dept.name,
                value: dept.id,
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
    ];
}
