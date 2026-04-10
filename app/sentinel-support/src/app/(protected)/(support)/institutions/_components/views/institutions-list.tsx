'use client';

import { useStableValue } from '@sentinel/hooks';
import { DataTable } from '@sentinel/ui';
import { type Institution } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(support)/institutions/_components/tables/columns';
import { InstitutionsEmptyState } from './institutions-empty-state';

interface InstitutionsListProps {
    institutions: Institution[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function InstitutionsList({
    institutions,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: InstitutionsListProps) {
    const facets = useStableValue(() => [], []);
    const emptyContent = useStableValue(
        () => <InstitutionsEmptyState searchTerm={searchTerm} />,
        [searchTerm],
    );

    return (
        <DataTable
            columns={columns}
            data={institutions}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search institutions..."
            facets={facets}
            isLoading={isLoading}
            emptyContent={emptyContent}
        />
    );
}
