import * as React from 'react';
import { Badge, DataTable } from '@sentinel/ui';
import type { TosMatrixData, TosMatrixRow } from '@sentinel/services';
import {
    BLOOM_LEVELS,
    BLOOM_LEVEL_LABELS,
    BLOOM_LEVEL_COLORS,
} from '../_constants';
import type { BloomLevel } from '@sentinel/services';
import { ColumnDef } from '@tanstack/react-table';

export type TosMatrixTableProps = {
    data?: TosMatrixData;
    isLoading: boolean;
    onRowClick?: (row: TosMatrixRow) => void;
};

function CellCount({ count, level }: { count: number; level: BloomLevel }) {
    if (count === 0) {
        return <span className="text-muted-foreground text-sm">—</span>;
    }

    return (
        <span
            className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${BLOOM_LEVEL_COLORS[level]}`}
        >
            {count}
        </span>
    );
}

export function TosMatrixTable({ data, isLoading, onRowClick }: TosMatrixTableProps) {
    const columns = React.useMemo<ColumnDef<TosMatrixRow>[]>(
        () => [
            {
                accessorKey: 'topic',
                header: () => <div className="min-w-[150px] px-2">Topic</div>,
                cell: ({ row }) => {
                    const topic = row.original.topic;
                    const truncatedTopic = topic.length > 35 ? `${topic.substring(0, 35)}...` : topic;
                    return (
                        <div
                            className="min-w-[150px] max-w-[300px] px-2 font-medium"
                            title={topic}
                        >
                            {truncatedTopic}
                        </div>
                    );
                },
            },
            ...BLOOM_LEVELS.map((level) => ({
                id: level,
                header: () => (
                    <div className="w-[90px] text-center">
                        <span className="whitespace-nowrap text-xs">{BLOOM_LEVEL_LABELS[level]}</span>
                    </div>
                ),
                cell: ({ row }: { row: { original: TosMatrixRow } }) => (
                    <div className="w-[90px] text-center">
                        <CellCount count={row.original.counts[level] ?? 0} level={level} />
                    </div>
                ),
            })),
            {
                accessorKey: 'total',
                header: () => <div className="w-[70px] text-center">Total</div>,
                cell: ({ row }) => (
                    <div className="w-[70px] text-center">
                        <Badge variant="secondary" className="font-semibold tabular-nums">
                            {row.original.total}
                        </Badge>
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <DataTable
            columns={columns}
            data={data?.rows ?? []}
            isLoading={isLoading}
            onRowClick={onRowClick}
            searchKey="topic"
            searchPlaceholder="Search topics..."
            emptyContent={
                <div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
                    <p className="font-medium">No TOS data yet</p>
                    <p className="mt-1 text-sm">
                        Generate AI questions and save them to the Question Bank to populate this
                        matrix.
                    </p>
                </div>
            }
        />
    );
}

