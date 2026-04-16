'use client';

import { AuditLogTable } from './_components';
import { MOCK_AUDIT_LOGS } from '@sentinel/shared/constants';
import { PageHeader } from '@sentinel/ui';

export default function SystemLogsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="System Logs"
                description="Audit trail of system activities and security events."
            />
            <AuditLogTable logs={MOCK_AUDIT_LOGS} />
        </div>
    );
}
