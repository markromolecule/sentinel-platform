"use client";

import { Institution } from '@sentinel/shared/types';
import { DataTable } from "@sentinel/ui";
import { columns } from "./columns";
import { useState } from "react";

interface InstitutionTableProps {
    institutions: Institution[];
}

export function InstitutionTable({ institutions }: InstitutionTableProps) {
    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

    const handleEdit = (institution: Institution) => {
        setEditingInstitution(institution);
        // Logic for opening edit dialog would go here
    };

    const handleDelete = (institution: Institution) => {
        if (confirm(`Are you sure you want to delete ${institution.name}?`)) {
            // Logic for deletion
            console.log("Delete institution", institution.id);
        }
    };

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns(handleEdit, handleDelete)}
                data={institutions}
                searchKey="name"
                searchPlaceholder="Filter institutions..."
            />
            
            {/* TODO: Add EditInstitutionDialog here later */}
        </div>
    );
}
