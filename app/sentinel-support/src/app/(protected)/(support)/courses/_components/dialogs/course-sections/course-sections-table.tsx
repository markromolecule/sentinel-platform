import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { Section } from '@sentinel/shared/types';
import { Button, DataTable, DataTableColumnHeader } from '@sentinel/ui';

interface CourseSectionsTableProps {
    sections: Section[];
    isLoading: boolean;
    onDelete: (section: Section) => void;
}

export function CourseSectionsTable({ sections, isLoading, onDelete }: CourseSectionsTableProps) {
    const columns = useMemo<ColumnDef<Section>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
                cell: ({ row }) => <span className="text-sm font-medium">{row.original.name}</span>,
            },
            {
                accessorKey: 'yearLevel',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
                cell: ({ row }) => <span className="text-sm">{row.original.yearLevel ?? '—'}</span>,
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                            onClick={() => onDelete(row.original)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [onDelete],
    );

    return (
        <div className="flex h-full min-h-[400px] flex-col gap-4 border-r pr-8">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Existing Sections</h3>
                <span className="text-muted-foreground text-xs">
                    {sections.length} sections found
                </span>
            </div>

            <div className="flex-1 overflow-auto">
                <DataTable
                    columns={columns}
                    data={sections}
                    isLoading={isLoading}
                    searchPlaceholder="Filter sections..."
                />
            </div>
        </div>
    );
}
