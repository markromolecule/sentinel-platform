'use client';

import {
    AdminStatsCards,
    SuperadminStatsCards,
    SystemHealth,
    ActiveSessionsWidget,
    FlaggedIncidentsWidget,
    RecentInstitutionsWidget,
} from '@/app/(protected)/dashboard/_components';
import { useStableValue } from '@sentinel/hooks';
import { MOCK_SYSTEM_STATS, MOCK_RECENT_ACTIVITY } from '@sentinel/shared/constants';
import { PageHeader } from '@sentinel/ui';
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
    const { data: user, isLoading } = useUser();
    const supportStats = useStableValue<typeof MOCK_SYSTEM_STATS>(
        () => [
            {
                label: 'Managed Institutions',
                value: '4',
                change: 25,
                trend: 'up',
                description: 'Support-managed organizations',
            },
            ...MOCK_SYSTEM_STATS.slice(1, 4),
        ],
        [],
    );

    if (isLoading) {
        return <div className="flex flex-1 items-center justify-center">Loading dashboard...</div>;
    }

    const role = user?.user_metadata?.role;

    if (role === 'support') {
        return (
            <div className="flex-1 space-y-4">
                <PageHeader title="Support Overview" />
                <div className="space-y-4">
                    <SuperadminStatsCards stats={supportStats} />
                    <div className="grid gap-4 lg:grid-cols-2">
                        <RecentInstitutionsWidget />
                        <div className="bg-card text-card-foreground text-muted-foreground flex items-center justify-center rounded-xl border p-6 text-center text-sm shadow">
                            Additional Global Metrics
                            <br />
                            (Coming Soon)
                        </div>
                    </div>
                    <SystemHealth recentActivity={MOCK_RECENT_ACTIVITY} />
                </div>
            </div>
        );
    }

    // Default to Admin Dashboard
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Dashboard Overview" />
            <div className="space-y-4">
                <AdminStatsCards stats={MOCK_SYSTEM_STATS} />
                <div className="grid gap-4 lg:grid-cols-2">
                    <ActiveSessionsWidget />
                    <FlaggedIncidentsWidget />
                </div>
                <SystemHealth recentActivity={MOCK_RECENT_ACTIVITY} />
            </div>
        </div>
    );
}
