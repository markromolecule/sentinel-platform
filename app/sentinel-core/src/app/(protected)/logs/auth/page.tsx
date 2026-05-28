import { AuthLogTable } from '../_components';
import { LogsPageShell } from '../_components/layout';

export default function AuthLogsPage() {
    return (
        <LogsPageShell
            title="Authentication Logs"
            description="Live audit trail of user login attempts, active sessions, and security event exceptions."
        >
            <AuthLogTable />
        </LogsPageShell>
    );
}
