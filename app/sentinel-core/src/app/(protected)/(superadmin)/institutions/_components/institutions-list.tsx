"use client";

import { DataTable } from "@sentinel/ui";
import { type Institution } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/institutions/_components/columns";

// interface for the institutions list
interface InstitutionsListProps {
    institutions: Institution[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
}

export function InstitutionsList({ institutions, searchTerm, onSearchChange }: InstitutionsListProps) {
    return (
        <DataTable
            columns={columns}
            data={institutions}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search institutions..."
            facets={[]}
        />
    );
}
