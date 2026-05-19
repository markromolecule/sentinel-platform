import { type ColumnDef } from '@tanstack/react-table';
import { type ClassroomDetail } from '@sentinel/shared/types';
import { DataTable } from '@sentinel/ui';

type ClassroomRosterSectionProps = {
    columns: ColumnDef<ClassroomDetail['students'][number]>[];
    students: ClassroomDetail['students'];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isLoading?: boolean;
};

export function ClassroomRosterSection({
    columns,
    students,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: ClassroomRosterSectionProps) {
    return (
        <section>
            <DataTable
                columns={columns}
                data={students}
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search roster..."
                isLoading={isLoading}
                emptyContent={
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div className="text-muted-foreground text-sm">
                            {searchTerm.trim()
                                ? 'No students matched your search.'
                                : 'No students are enrolled in this classroom yet.'}
                        </div>
                    </div>
                }
            />
        </section>
    );
}
