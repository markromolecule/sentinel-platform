'use client';

import { type DataTableFacet } from '@sentinel/ui';

export const administratorFacets = [
    {
        columnKey: 'role',
        title: 'Role',
        options: [
            { label: 'Super Admin', value: 'superadmin' },
            { label: 'Admin', value: 'admin' },
        ],
    },
    {
        columnKey: 'status',
        title: 'Status',
        options: [
            { label: 'Online', value: 'active' },
            { label: 'Offline', value: 'offline' },
        ],
    },
] satisfies DataTableFacet[];
