'use client';

import { useState } from 'react';
import {
    DataTable,
    Button,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import { StudentsTableProps } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(instructor)/students/_components/tables/columns';
import { MOCK_SECTIONS } from '@sentinel/shared/constants';
import { useBulkUnenrollStudents } from '@/app/(protected)/(instructor)/students/_hooks/use-bulk-unenroll-students';
import { Trash2 } from 'lucide-react';

export function StudentsTable({ students }: StudentsTableProps) {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { mutate: bulkUnenroll, isPending: isDeleting } = useBulkUnenrollStudents();

    // Map row selection indices back to student objects and retrieve their enrollment IDs
    const selectedIndexes = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    const selectedRows = selectedIndexes.map((idx) => students[Number(idx)]).filter(Boolean);
    const selectedEnrollmentIds = selectedRows.flatMap((student) =>
        student.enrollmentIds
            ? student.enrollmentIds
                  .split(',')
                  .map((id) => id.trim())
                  .filter(Boolean)
            : [],
    );

    const handleBulkDelete = () => {
        bulkUnenroll(selectedEnrollmentIds, {
            onSuccess: () => {
                setRowSelection({});
                setConfirmOpen(false);
            },
        });
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={students}
                searchKey="name"
                searchPlaceholder="Search students..."
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={
                    selectedEnrollmentIds.length > 0 ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmOpen(true)}
                            disabled={isDeleting}
                            className="h-8"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Enrolled ({selectedRows.length})
                        </Button>
                    ) : undefined
                }
                facets={[
                    {
                        columnKey: 'yearLevel',
                        title: 'Year Level',
                        options: [
                            { label: '1st Year', value: '1st Year' },
                            { label: '2nd Year', value: '2nd Year' },
                            { label: '3rd Year', value: '3rd Year' },
                            { label: '4th Year', value: '4th Year' },
                            { label: '5th Year', value: '5th Year' },
                        ],
                    },
                    {
                        columnKey: 'section',
                        title: 'Section',
                        options: MOCK_SECTIONS.map((s) => ({ label: s, value: s })),
                    },
                    {
                        columnKey: 'status',
                        title: 'Status',
                        options: [
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' },
                            { label: 'Archived', value: 'archived' },
                        ],
                    },
                ]}
            />

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{' '}
                            <strong>
                                {selectedRows.length} selected student
                                {selectedRows.length > 1 ? 's' : ''}
                            </strong>{' '}
                            from their assigned subjects and sections. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Removing...' : 'Remove Selected'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
