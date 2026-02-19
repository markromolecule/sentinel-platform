"use client";

import { AuditLogTable } from "@/app/(protected)/admin/logs/_components";
import { MOCK_AUDIT_LOGS } from "@/app/(protected)/admin/_constants";
import { PageHeader } from "@/components/common";

export default function SystemLogsPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="System Logs"
                description="Audit trail of system activities and security events."
            />
            <AuditLogTable logs={MOCK_AUDIT_LOGS} />
        </div>
    );
}
