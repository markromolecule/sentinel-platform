'use client';

import { useStableValue } from '@sentinel/hooks';
import { Institution } from '@sentinel/shared/types';
import { DataTable } from '@sentinel/ui';
import { useMemo } from 'react';
import { createInstitutionColumns } from './columns';

interface InstitutionTableProps {
    institutions: Institution[];
}

export function InstitutionTable({ institutions }: InstitutionTableProps) {
    const facets = useStableValue(() => [], []);
    const columns = useMemo(() => createInstitutionColumns(institutions), [institutions]);

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={institutions}
                searchKey="name"
                searchPlaceholder="Filter institutions..."
                facets={facets}
            />
        </div>
    );
}
