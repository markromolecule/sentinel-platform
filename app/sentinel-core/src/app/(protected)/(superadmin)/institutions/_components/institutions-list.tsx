"use client";

import { DataTable } from "@sentinel/ui";
import { type Institution } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/institutions/_components/columns";

// interface for the institutions list
interface InstitutionsListProps {
    institutions: Institution[];
}

export function InstitutionsList({ institutions }: InstitutionsListProps) {
    return (
        <DataTable
            columns={columns}
            data={institutions}
            searchKey="name"
            searchPlaceholder="Search institutions..."
            facets={[]}
        />
    );
}
