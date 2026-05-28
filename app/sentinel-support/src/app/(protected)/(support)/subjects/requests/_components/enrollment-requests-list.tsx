'use client';

import { useState } from 'react';
import { type RowSelectionState } from '@tanstack/react-table';
import { DataTable } from '@sentinel/ui';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
} from '@sentinel/ui';
import { type EnrollmentRequest } from '@sentinel/shared/types';
import {
    useActivePermissions,
    useDeleteEnrollmentRequestsMutation,
    useStableValue,
} from '@sentinel/hooks';
import { Loader2, Trash2 } from 'lucide-react';
import { requestColumns } from './columns';
import { buildEnrollmentRequestFacets } from './enrollment-request-facets';
import { EnrollmentRequestsEmptyState } from './enrollment-requests-empty-state';

type EnrollmentRequestsListProps = {
    requests: EnrollmentRequest[];
    departments: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; title: string }>;
    sections: Array<{ id: string; name: string }>;
    isLoading?: boolean;
};

/**
 * EnrollmentRequestsList renders the requests in a DataTable with multi-select delete functionality.
 */
export function EnrollmentRequestsList({
    requests,
    departments,
    courses,
    sections,
    isLoading = false,
}: EnrollmentRequestsListProps) {
    const { hasPermission } = useActivePermissions();
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [deleteOpen, setDeleteOpen] = useState(false);
    const canDeleteRequests = hasPermission('subject_offerings:approve');

    const selectedRequests = useStableValue(
        () => requests.filter((_, index) => rowSelection[String(index)]),
        [requests, rowSelection],
    );
    const selectedRequestIds = useStableValue(
        () =>
            selectedRequests.flatMap((request) =>
                request.sections.map((section) => section.request_id),
            ),
        [selectedRequests],
    );

    const deleteSelectedRequests = useDeleteEnrollmentRequestsMutation({
        onSuccess: () => {
            setDeleteOpen(false);
            setRowSelection({});
        },
    });

    const facets = useStableValue(
        () => buildEnrollmentRequestFacets({ departments, courses, sections }),
        [courses, departments, sections],
    );

    const toolbarActions = useStableValue(
        () =>
            canDeleteRequests && selectedRequests.length > 0 ? (
                <Button
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedRequests.length})
                </Button>
            ) : null,
        [canDeleteRequests, selectedRequests.length],
    );

    return (
        <>
            <DataTable
                columns={requestColumns}
                data={requests}
                searchKey="instructor_name"
                searchPlaceholder="Search by instructor..."
                facets={facets}
                initialColumnVisibility={{
                    department_id: false,
                    course_id: false,
                    section_id: false,
                }}
                isLoading={isLoading}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                toolbarActions={toolbarActions}
                emptyContent={<EnrollmentRequestsEmptyState />}
            />

            {canDeleteRequests ? (
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Delete selected enrollment requests?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete {selectedRequests.length} selected
                                request
                                {selectedRequests.length === 1 ? '' : 's'}. Any approved request in
                                the selection will also remove the instructor assignment for its
                                affected sections.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteSelectedRequests.isPending}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90 text-white"
                                disabled={deleteSelectedRequests.isPending}
                                onClick={(event) => {
                                    event.preventDefault();
                                    deleteSelectedRequests.mutate(selectedRequestIds);
                                }}
                            >
                                {deleteSelectedRequests.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    `Delete Selected (${selectedRequests.length})`
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : null}
        </>
    );
}
