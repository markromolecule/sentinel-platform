"use client";

import { SuperadminStatsCards, SystemHealth, RecentInstitutionsWidget } from "./_components";
import { MOCK_SYSTEM_STATS, MOCK_RECENT_ACTIVITY } from '@sentinel/shared/constants';
import { PageHeader } from "@/components/common";

// Mock Data for Superadmin Stats (similarly structured but contextually different)
const SUPERADMIN_STATS: typeof MOCK_SYSTEM_STATS = [
    {
        label: 'Total Institutions',
        value: '4',
        change: 25,
        trend: 'up',
        description: 'Registered organizations',
    },
    ...MOCK_SYSTEM_STATS.slice(1, 4) // Reusing other stats just for mock display
];


export default function SuperadminDashboard() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="System Overview" />

            <div className="space-y-4">
                <SuperadminStatsCards stats={SUPERADMIN_STATS} />

                <div className="grid gap-4 lg:grid-cols-2">
                    <RecentInstitutionsWidget />
                    {/* Placeholder for future global widgets */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow flex items-center justify-center text-muted-foreground p-6 text-sm text-center">
                        Additional Global Metrics<br/>(Coming Soon)
                    </div>
                </div>

                <SystemHealth recentActivity={MOCK_RECENT_ACTIVITY} />
            </div>
        </div>
    );
}
