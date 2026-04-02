"use client";

import { useMemo, useState } from "react";
import { type RowSelectionState } from "@tanstack/react-table";
import { DataTable } from "@sentinel/ui";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Button } from "@sentinel/ui";
import { type EnrollmentRequest } from "@sentinel/shared/types";
import { useDeleteEnrollmentRequestsMutation } from "@sentinel/hooks";
import { Loader2, Trash2 } from "lucide-react";
import { requestColumns } from "@/app/(protected)/(admin)/subjects/requests/_components/columns";
import { buildEnrollmentRequestFacets } from "@/app/(protected)/(admin)/subjects/requests/_components/enrollment-request-facets";
import { EnrollmentRequestsEmptyState } from "@/app/(protected)/(admin)/subjects/requests/_components/enrollment-requests-empty-state";

type EnrollmentRequestsListProps = {
    requests: EnrollmentRequest[];
    departments: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; title: string }>;
    sections: Array<{ id: string; name: string }>;
    isLoading?: boolean;
};

export function EnrollmentRequestsList({
    requests,
    departments,
    courses,
    sections,
    isLoading = false,
}: EnrollmentRequestsListProps) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [deleteOpen, setDeleteOpen] = useState(false);

    const selectedRequests = useMemo(
        () => requests.filter((_, index) => rowSelection[String(index)]),
        [requests, rowSelection],
    );
    const selectedRequestIds = selectedRequests.flatMap((request) =>
        request.sections.map((section) => section.request_id),
    );

    const deleteSelectedRequests = useDeleteEnrollmentRequestsMutation({
        onSuccess: () => {
            setDeleteOpen(false);
            setRowSelection({});
        },
    });

    const toolbarActions =
        selectedRequests.length > 0 ? (
            <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedRequests.length})
            </Button>
        ) : null;

    return (
        <>
            <DataTable
                columns={requestColumns}
                data={requests}
                searchKey="instructor_name"
                searchPlaceholder="Search by instructor..."
                facets={buildEnrollmentRequestFacets({ departments, courses, sections })}
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

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete selected enrollment requests?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedRequests.length} selected request
                            {selectedRequests.length === 1 ? "" : "s"}. Any approved request in the
                            selection will also remove the instructor assignment for its affected sections.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteSelectedRequests.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
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
        </>
    );
}
