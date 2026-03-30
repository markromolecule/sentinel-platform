"use client";

import { DataTable } from "@sentinel/ui";
import { type Institution } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/institutions/_components/tables/columns";
import { InstitutionsEmptyState } from "./institutions-empty-state";

// interface for the institutions list
interface InstitutionsListProps {
    institutions: Institution[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function InstitutionsList({
    institutions,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: InstitutionsListProps) {
    return (
        <DataTable
            columns={columns}
            data={institutions}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search institutions..."
            facets={[]}
            emptyContent={isLoading ? <div className="h-32" /> : <InstitutionsEmptyState searchTerm={searchTerm} />}
        />
    );
}
