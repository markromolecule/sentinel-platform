"use client";

import { AddInstitutionDialog } from "@/app/(protected)/(superadmin)/institutions/_components/add-institution-dialog";
import { InstitutionsList } from "@/app/(protected)/(superadmin)/institutions/_components/institutions-list";
import { PageHeader } from "@sentinel/ui";
import { useInstitutionsQuery } from "@/hooks/query/institutions";

// superadmin institutions page
export default function SuperadminInstitutionsPage() {
    // get institutions from the api with mock fallback
    const { data: institutions = [], isLoading, isError } = useInstitutionsQuery();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title="Institution Management" description="Manage academic institutions and their configurations." />
                <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title="Institution Management" description="Manage academic institutions and their configurations." />
                <div className="flex h-48 items-center justify-center text-destructive">
                    Error loading Institutions. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Institution Management"
                description="Manage academic institutions and their configurations."
            >
                <AddInstitutionDialog />
            </PageHeader>

            <InstitutionsList institutions={institutions} />
        </div>
    );
}

