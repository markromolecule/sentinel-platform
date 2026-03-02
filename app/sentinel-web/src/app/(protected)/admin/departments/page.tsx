"use client";

import { AddDepartmentDialog } from "@/app/(protected)/admin/departments/_components/add-department-dialog";
import { DepartmentsList } from "@/app/(protected)/admin/departments/_components/departments-list";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { PageHeader } from "@/components/common";

// admin departments page
export default function AdminDepartmentsPage() {
    // get departments from the api
    const {
        data: departments = [],
        isLoading,
        isError,
        error
    } = useDepartmentsQuery();

    // show loading state
    if (isLoading) {
        return <div className="p-8">Loading departments...</div>;
    }

    // show error state
    if (isError) {
        return (
            <div className="p-8 text-red-500">
                Failed to load departments. Error: {error?.message}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Department Management"
                description="Manage academic departments and codes."
            >
                <AddDepartmentDialog />
            </PageHeader>

            <DepartmentsList departments={departments} />
        </div>
    );
}
