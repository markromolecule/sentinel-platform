"use client";

import { DataTable, EmptyState } from "@sentinel/ui";
import { type Institution } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/institutions/_components/columns";
import { AddInstitutionDialog } from "@/app/(protected)/(superadmin)/institutions/_components/add-institution-dialog";

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
            emptyContent={
                <EmptyState
                    icon="🏛️"
                    title={searchTerm ? "No results found" : "No institutions added"}
                    description={
                        searchTerm
                            ? `We couldn't find any institutions matching "${searchTerm}".`
                            : "Add institutions to the system to start managing them."
                    }
                    action={!searchTerm && <AddInstitutionDialog />}
                />
            }
        />
    );
}
