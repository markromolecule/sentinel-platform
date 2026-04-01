"use client";

import { EmptyState } from "@sentinel/ui";
import { AddInstitutionDialog } from "@/app/(protected)/(support)/institutions/_components/dialogs/add-institution-dialog";

interface InstitutionsEmptyStateProps {
    searchTerm?: string;
}

export function InstitutionsEmptyState({ searchTerm }: InstitutionsEmptyStateProps) {
    return (
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
    );
}
