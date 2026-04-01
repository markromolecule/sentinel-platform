"use client";

import { useDebounce, useInstitutionsQuery } from "@sentinel/hooks";
import { useState } from "react";
import { AddInstitutionDialog, InstitutionsList } from "@/app/(protected)/(support)/institutions/_components";
import { PageHeader, Separator } from "@sentinel/ui";

export default function SupportInstitutionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // get institutions from the api with mock fallback
    const { data: institutions = [], isLoading, isError } = useInstitutionsQuery(debouncedSearch);


    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Institution Management"
                description="Manage academic institutions and their configurations."
            >
                <AddInstitutionDialog />
            </PageHeader>
            <Separator />

            <div className="relative">
                {/* Always render InstitutionsList to keep search bar mounted and focused */}
                <InstitutionsList 
                    institutions={institutions} 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                />

                {/* Subtle loading overlay only for initial empty state */}
                {isLoading && institutions.length === 0 && (
                     <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center bg-background/80 z-10 rounded-md">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                     </div>
                )}

                {isError && (
                     <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                          Error loading institutions. Please try again.
                     </div>
                )}
            </div>
        </div>
    );
}
