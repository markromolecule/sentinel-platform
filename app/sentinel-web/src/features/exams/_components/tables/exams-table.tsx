'use client';

import { DataTable } from '@sentinel/ui';
import { ExamsGridProps } from '@sentinel/shared/types';
import { EXAM_STATUS_OPTIONS } from '@sentinel/shared/constants';
import { columns } from './columns';

export type ExamsTableProps = ExamsGridProps & {
    toolbarActions?: React.ReactNode;
};

export function ExamsTable({ exams, toolbarActions }: ExamsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={exams}
            searchKey="title"
            searchPlaceholder="Search exams..."
            toolbarActions={toolbarActions}
            facets={[
                {
                    columnKey: 'status',
                    title: 'Status',
                    options: EXAM_STATUS_OPTIONS.map((o) => ({
                        label: o.label,
                        value: o.value,
                    })),
                },
            ]}
        />
    );
}
