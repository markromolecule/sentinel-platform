'use client';

import { type DataTableFacet } from '@sentinel/ui';

export const examFacets = [
    {
        columnKey: 'status',
        title: 'Status',
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' },
            { label: 'Draft', value: 'draft' },
        ],
    },
] satisfies DataTableFacet[];
