"use client";

import { InstitutionTable } from "./_components";
import { MOCK_INSTITUTIONS } from '@sentinel/shared/mock-data';
import { AddInstitutionDialog } from "./_components/add-institution-dialog";
import { PageHeader } from "@/components/common";

export default function SuperadminInstitutionsPage() {
    // In a real scenario, this would be a query hook (e.g., useInstitutionsQuery)
    const institutions = MOCK_INSTITUTIONS;
    const isLoading = false;

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Institution Management"
                description="Manage academic institutions, their codes, and registration status."
            >
                <AddInstitutionDialog />
            </PageHeader>

            <InstitutionTable institutions={institutions} />
        </div>
    );
}
