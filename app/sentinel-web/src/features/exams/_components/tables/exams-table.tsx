'use client';

import { DataTable } from '@sentinel/ui';
import { ExamsGridProps } from '@sentinel/shared/types';
import { MOCK_AVAILABLE_SUBJECTS } from '@sentinel/shared/constants';
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
                {
                    columnKey: 'subject',
                    title: 'Subject',
                    options: MOCK_AVAILABLE_SUBJECTS.map((s) => ({
                        label: s.title,
                        value: s.title,
                    })),
                },
            ]}
        />
    );
}
