"use client";

import { AddDepartmentDialog } from "@/app/(protected)/(superadmin)/departments/_components/add-department-dialog";
import { DepartmentsList } from "@/app/(protected)/(superadmin)/departments/_components/departments-list";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { PageHeader } from "@/components/common";

// admin departments page
export default function AdminDepartmentsPage() {
    // get departments from the api
    const { data: departments = [], isLoading, isError } = useDepartmentsQuery();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title="Department Management" description="Manage academic departments and codes." />
                <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title="Department Management" description="Manage academic departments and codes." />
                <div className="flex h-48 items-center justify-center text-destructive">
                    Error loading Sections. Please try again.
                </div>
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
