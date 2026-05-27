'use client';

import { LogsTabsView } from './_components';
import { PageHeader } from '@sentinel/ui';

export default function SystemLogsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 bg-background/50">
            <PageHeader
                title="System Logs"
                description="Live audit trail of system activities, background tasks, and user security events."
            />
            <LogsTabsView />
        </div>
    );
}
