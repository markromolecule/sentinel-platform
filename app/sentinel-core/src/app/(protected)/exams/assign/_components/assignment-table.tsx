'use client';

import { DataTable } from '@sentinel/ui';
import { columns } from './columns';
import { useMemo } from 'react';

export interface InstructorAssignmentRow {
    id: string;
    title: string;
    subject: string;
    scheduledDate: string | null;
    assignedInstructor: string;
    instructorAvatarUrl?: string | null;
    roomName?: string | null;
    sectionNames?: string[];
    status: string;
    relationship: 'INBOUND' | 'OUTBOUND';
}

interface ProctorAssignmentTableProps {
    data: InstructorAssignmentRow[];
    isLoading?: boolean;
}

export function ProctorAssignmentTable({ data, isLoading = false }: ProctorAssignmentTableProps) {
    const subjectOptions = useMemo(
        () =>
            Array.from(new Set(data.map((assignment) => assignment.subject)))
                .filter(Boolean)
                .map((subject) => ({
                    label: subject,
                    value: subject,
                })),
        [data],
    );

    return (
        <DataTable<InstructorAssignmentRow, unknown>
            columns={columns}
            data={data}
            searchKey="title"
            searchPlaceholder="Search exams..."
            isLoading={isLoading}
            facets={[
                {
                    columnKey: 'relationship',
                    title: 'Direction',
                    options: [
                        { label: 'Assigned To Me', value: 'INBOUND' },
                        { label: 'Assigned By Me', value: 'OUTBOUND' },
                    ],
                },
                {
                    columnKey: 'status',
                    title: 'Status',
                    options: Array.from(new Set(data.map((assignment) => assignment.status))).map(
                        (status) => ({
                            label: status.toLowerCase().replace(/_/g, ' '),
                            value: status,
                        }),
                    ),
                },
                {
                    columnKey: 'subject',
                    title: 'Subject',
                    options: subjectOptions,
                },
            ]}
            emptyContent={
                <div className="text-muted-foreground py-12 text-center text-sm">
                    No exam assignments found.
                </div>
            }
        />
    );
}
