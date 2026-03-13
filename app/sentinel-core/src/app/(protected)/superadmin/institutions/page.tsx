"use client";

import { AddInstitutionDialog } from "@/app/(protected)/superadmin/institutions/_components/add-institution-dialog";
import { InstitutionsList } from "@/app/(protected)/superadmin/institutions/_components/institutions-list";
import { PageHeader } from "@/components/common";
import { MOCK_INSTITUTIONS } from "@sentinel/shared/mock-data";

// superadmin institutions page
export default function SuperadminInstitutionsPage() {
    // using mock data for now to visualize ui
    const institutions = MOCK_INSTITUTIONS || [];

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
