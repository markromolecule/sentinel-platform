"use client";

import { Institution } from '@sentinel/shared/types';
import { DataTable } from "@sentinel/ui";
import { columns } from "./columns";
import { useState } from "react";

interface InstitutionTableProps {
    institutions: Institution[];
}

export function InstitutionTable({ institutions }: InstitutionTableProps) {
    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={institutions}
                searchKey="name"
                searchPlaceholder="Filter institutions..."
            />
            
            {/* TODO: Add EditInstitutionDialog here later */}
        </div>
    );
}
