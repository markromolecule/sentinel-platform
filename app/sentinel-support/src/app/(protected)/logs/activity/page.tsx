import { ActivityLogTable } from '../_components';
import { LogsPageShell } from '../_components/layout';

export default function ActivityLogsPage() {
    return (
        <LogsPageShell
            title="Activity Logs"
            description="Audit trail of standard database modifications, administrative activities, and user operations."
        >
            <ActivityLogTable />
        </LogsPageShell>
    );
}
