'use client';

import { type DataTableFacet } from '@sentinel/ui';

type CourseFacetsArgs = {
    departments: Array<{ id: string; name: string; code?: string | null }>;
};

/**
 * Helper function to build faceted search filtering options based on department listings.
 */
export function buildCourseFacets({ departments }: CourseFacetsArgs): DataTableFacet[] {
    return [
        {
            columnKey: 'department',
            title: 'Department',
            options: departments.map((department) => ({
                label: department.code || department.name,
                value: department.id,
            })),
        },
    ];
}
