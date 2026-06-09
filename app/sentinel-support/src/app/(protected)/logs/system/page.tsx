import { SystemLogTable } from '../_components';
import { LogsPageShell } from '../_components/layout';

export default function SystemLogsPage() {
    return (
        <LogsPageShell
            title="System Logs"
            description="Audit trail of internal background tasks, API communication status, and scheduler performance."
        >
            <SystemLogTable />
        </LogsPageShell>
    );
}
