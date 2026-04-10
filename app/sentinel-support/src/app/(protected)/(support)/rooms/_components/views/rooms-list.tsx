'use client';

import { useInstitutionsQuery, useStableValue } from '@sentinel/hooks';
import { DataTable } from '@sentinel/ui';
import { type Room } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(support)/rooms/_components/tables/columns';
import { RoomsEmptyState } from './rooms-empty-state';

// interface for the rooms list
interface RoomsListProps {
    rooms: Room[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function RoomsList({
    rooms,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: RoomsListProps) {
    const { data: institutions = [] } = useInstitutionsQuery();

    const facets = useStableValue(
        () => [
            {
                columnKey: 'institution',
                title: 'Institution',
                options: institutions.map((institution) => ({
                    label: institution.name,
                    value: institution.name,
                })),
            },
        ],
        [institutions],
    );

    return (
        <DataTable
            columns={columns}
            data={rooms}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search rooms or institutions..."
            facets={facets}
            isLoading={isLoading}
            emptyContent={<RoomsEmptyState searchTerm={searchTerm} />}
        />
    );
}
