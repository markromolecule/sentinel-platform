"use client";

import { useDebounce, useDepartmentsQuery } from "@sentinel/hooks";
import { useState } from "react";
import { AddDepartmentDialog, DepartmentsList } from "@/app/(protected)/(support)/departments/_components";
import { PageHeader, Separator } from "@sentinel/ui";

export default function SupportDepartmentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // get departments from the api
    const { data: departments = [], isLoading, isError } = useDepartmentsQuery(debouncedSearch);


    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Department Management"
                description="Manage academic departments and codes."
            >
                <AddDepartmentDialog />
            </PageHeader>
            <Separator />

            <div className="relative">
                {/* Always render DepartmentsList to keep search bar mounted and focused */}
                <DepartmentsList
                    departments={departments}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                />

                {/* Subtle loading overlay only for initial empty state */}
                {isLoading && departments.length === 0 && (
                    <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center bg-background/80 z-10 rounded-md">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                )}

                {isError && (
                    <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                        Error loading departments. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
}
