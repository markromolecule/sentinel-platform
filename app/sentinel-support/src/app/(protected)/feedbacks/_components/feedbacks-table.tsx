import { type ColumnDef, type PaginationState, type RowData } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { type FeedbackRecord } from '@sentinel/services';
import { Badge, Button, DataTable, DataTableColumnHeader, type DataTableFacet } from '@sentinel/ui';

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        onOpenFeedback?: (feedback: TData) => void;
    }
}

const columns: ColumnDef<FeedbackRecord>[] = [
    {
        accessorKey: 'rating',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
        cell: ({ row }) => <Badge variant="secondary">{row.original.rating}/5</Badge>,
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => (
            <div className="space-y-0.5">
                <div className="font-medium">{row.original.studentName ?? 'Unknown student'}</div>
                <div className="text-muted-foreground text-xs">
                    {row.original.studentEmail ?? 'No email'}
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'examTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Exam" />,
        cell: ({ row }) => <span>{row.original.examTitle ?? 'Untitled exam'}</span>,
    },
    {
        accessorKey: 'institutionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />,
        cell: ({ row }) => <span>{row.original.institutionName ?? 'Unknown institution'}</span>,
    },
    {
        accessorKey: 'experience',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Experience" />,
        cell: ({ row }) => {
            const value = row.original.experience?.trim();
            return (
                <div
                    className="max-w-[340px] truncate text-sm"
                    title={value || 'No written feedback'}
                >
                    {value || 'No written feedback'}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm">
                {new Date(row.original.createdAt).toLocaleString()}
            </span>
        ),
    },
    {
        id: 'actions',
        enableSorting: false,
        cell: ({ row, table }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => table.options.meta?.onOpenFeedback?.(row.original)}
            >
                <Eye className="mr-2 h-4 w-4" />
                View
            </Button>
        ),
    },
];

const facets: DataTableFacet[] = [
    {
        columnKey: 'rating',
        title: 'Rating',
        options: [
            { label: '5 / 5', value: '5' },
            { label: '4 / 5', value: '4' },
            { label: '3 / 5', value: '3' },
            { label: '2 / 5', value: '2' },
            { label: '1 / 5', value: '1' },
        ],
    },
];

export function FeedbacksTable({
    feedbacks,
    pagination,
    onPaginationChange,
    pageCount,
    totalCount,
    isLoading,
    searchTerm,
    onSearchChange,
    onOpenFeedback,
}: {
    feedbacks: FeedbackRecord[];
    pagination: PaginationState;
    onPaginationChange: (pagination: PaginationState) => void;
    pageCount: number;
    totalCount: number;
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onOpenFeedback: (feedback: FeedbackRecord) => void;
}) {
    return (
        <DataTable
            columns={columns}
            data={feedbacks}
            searchKey="studentName"
            searchPlaceholder="Search student, exam, institution, or experience..."
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            facets={facets}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            pageCount={pageCount}
            totalCount={totalCount}
            manualPagination
            isLoading={isLoading}
            meta={{ onOpenFeedback }}
        />
    );
}
