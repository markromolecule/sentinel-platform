'use client';

import { type DataTableFacet } from '@sentinel/ui';

type CourseFacetsArgs = {
    departments: Array<{ id: string; name: string; code?: string | null }>;
};

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
