"use client";

import { Button } from "@sentinel/ui";
import { Plus } from "lucide-react";
import { ProctorAssignmentList as AssignmentList } from "@/app/(protected)/(admin)/proctor/assignment/_components";
import { MOCK_PROCTOR_ASSIGNMENTS } from '@sentinel/shared/constants';;
import { useProctorAssignment } from "@/app/(protected)/(admin)/proctor/assignment/_hooks/use-proctor-assignment";
import { AssignProctorDialog } from "@/app/(protected)/(admin)/proctor/assignment/_components/assign-proctor-dialog";
import { PageHeader } from "@sentinel/ui";

export default function ProctorAssignmentPage() {
    const {
        filteredAssignments,
        editingAssignment,
        isCreateDialogOpen,
        handleEdit,
        handleCreate,
        handleCloseDialog,
    } = useProctorAssignment({ assignments: MOCK_PROCTOR_ASSIGNMENTS });

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Instructor Assignment"
                description="Overview of current exam instructor allocations."
            >
                <Button size="sm" onClick={handleCreate} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Instructor
                </Button>
            </PageHeader>

            <AssignmentList
                assignments={filteredAssignments}
                onEdit={handleEdit}
            />

            <AssignProctorDialog
                open={!!editingAssignment || isCreateDialogOpen}
                onOpenChange={handleCloseDialog}
                assignment={editingAssignment}
            />
        </div>
    );
}
