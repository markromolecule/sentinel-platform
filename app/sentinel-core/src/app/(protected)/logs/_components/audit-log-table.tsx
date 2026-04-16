'use client';

import { AuditLog } from '@sentinel/shared/types';
import { DataTable } from '@sentinel/ui';
import { columns } from './columns';

interface AuditLogTableProps {
    logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
    return (
        <DataTable
            columns={columns}
            data={logs}
            searchKey="details"
            searchPlaceholder="Search logs..."
            facets={[
                {
                    columnKey: 'action',
                    title: 'Action',
                    options: [
                        { label: 'Login', value: 'LOGIN_SUCCESS' },
                        { label: 'Exam Start', value: 'EXAM_START' },
                        { label: 'Exam End', value: 'EXAM_END' },
                        { label: 'Config Update', value: 'CONFIG_UPDATE' },
                    ],
                },
                {
                    columnKey: 'resourceType',
                    title: 'Resource',
                    options: [
                        { label: 'Auth', value: 'Auth' },
                        { label: 'Exam', value: 'Exam' },
                        { label: 'System', value: 'System' },
                    ],
                },
            ]}
        />
    );
}
