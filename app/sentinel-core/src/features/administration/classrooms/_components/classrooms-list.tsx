import { useRouter } from 'next/navigation';
import { DataTable } from '@sentinel/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { type ClassroomSummary } from '@sentinel/shared/types';
import { ClassroomsEmptyState } from './classrooms-empty-state';

type ClassroomsListProps = {
    classrooms: ClassroomSummary[];
    columns: ColumnDef<ClassroomSummary>[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    isLoading?: boolean;
};

export function ClassroomsList({
    classrooms,
    columns,
    searchTerm,
    onSearchChange,
    onCreateClick,
    isLoading = false,
}: ClassroomsListProps) {
    const router = useRouter();

    return (
        <DataTable
            columns={columns}
            data={classrooms}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search classrooms..."
            isLoading={isLoading}
            onRowClick={(row) => router.push(`/classrooms/${row.id}`)}
            emptyContent={
                <ClassroomsEmptyState searchTerm={searchTerm} onCreateClick={onCreateClick} />
            }
        />
    );
}
