"use client";

import { AdministratorsList } from "@/app/(protected)/(superadmin)/administrators/_components/administrators-list";
import { PageHeader } from "@/components/common";
import { MOCK_ADMINISTRATORS } from "@sentinel/shared/mock-data";
import { Button } from "@sentinel/ui";
import { Plus } from "lucide-react";

export default function SuperadminAdministratorsPage() {
    // For now use mock data directly as requested
    const administrators = MOCK_ADMINISTRATORS;

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Administrator Management"
                description="Manage system administrators and their institutional access."
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Administrator
                </Button>
            </PageHeader>

            <AdministratorsList administrators={administrators} />
        </div>
    );
}
