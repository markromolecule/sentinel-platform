"use client";

import { PageHeader } from "@/components/common";
import { MOCK_ADMIN_ASSIGNMENTS } from "@sentinel/shared/mock-data";
import { DataTable, Button } from "@sentinel/ui";
import { Plus } from "lucide-react";
import { columns } from "./_components/columns";

export default function SuperadminAdminAssignmentsPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Admin-Institution Assignments"
                description="Manage and distribute system administrators across different academic institutions."
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Link Admin to Institution
                </Button>
            </PageHeader>

            <DataTable
                columns={columns}
                data={MOCK_ADMIN_ASSIGNMENTS}
                searchKey="adminName"
                searchPlaceholder="Search by administrator name..."
                facets={[]}
            />
        </div>
    );
}
