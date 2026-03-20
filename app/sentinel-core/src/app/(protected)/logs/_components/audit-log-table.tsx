"use client";

import { AuditLog } from '@sentinel/shared/types';;
import { DataTable } from "@sentinel/ui";
import { columns } from "./columns";

interface AuditLogTableProps {
    logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
    return (
        <DataTable
            columns={columns}
            data={logs}
            searchKey="details"
            searchPlaceholder="Search logs..."
        />
    );
}
