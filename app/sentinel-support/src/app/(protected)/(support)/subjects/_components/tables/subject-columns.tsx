import { ColumnDef } from '@tanstack/react-table';
import { MasterSubject } from '@sentinel/shared/types';
import { Button, DataTableColumnHeader } from '@sentinel/ui';
import { Edit2, Trash2 } from 'lucide-react';
import { OriginStatusBadge } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { getOriginStatusLabel } from '@/app/(protected)/(support)/_components/origin-status-badge';
import { getSubjectId } from '@/app/(protected)/(support)/subjects/_hooks/use-subjects-page-state/_types';

export type SubjectColumnsProps = {
    onEdit: (subject: MasterSubject) => void;
    onDelete: (subject: MasterSubject) => void;
    onRevert: (subject: MasterSubject) => void;
};

export const getSubjectColumns = ({
    onEdit,
    onDelete,
    onRevert,
}: SubjectColumnsProps): ColumnDef<MasterSubject>[] => [
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ row }) => (
            <div className="max-w-[400px]" title={row.original.title.trim()}>
                {row.original.title.trim()}
            </div>
        ),
    },
    {
        id: 'classifications',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Classifications" />,
        cell: ({ row }) => {
            const classifications =
                row.original.classifications
                    ?.map((classification) => classification.name.trim())
                    .join(', ') || '—';
            return (
                <div className="max-w-[200px] truncate" title={classifications}>
                    {classifications}
                </div>
            );
        },
    },
    {
        accessorFn: (row) => row.institutionName ?? '',
        id: 'institution',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
        cell: ({ row }) => row.original.institutionName || '-',
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        id: 'origin',
        accessorFn: (row) => getOriginStatusLabel(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
        cell: ({ row }) => <OriginStatusBadge record={row.original} />,
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const subjectId = getSubjectId(row.original);

            return (
                <div className="flex justify-end gap-1">
                    {row.original.isOverridden ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!subjectId}
                            onClick={() => onRevert(row.original)}
                        >
                            Revert
                        </Button>
                    ) : null}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit subject</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!subjectId}
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete subject</span>
                    </Button>
                </div>
            );
        },
    },
];
