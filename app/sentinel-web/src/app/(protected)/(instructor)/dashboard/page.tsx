'use client';

import { useProctorDashboard } from '@/app/(protected)/(instructor)/dashboard/_hooks/use-proctor-dashboard';
import {
    DashboardShell,
    DashboardGreeting,
    DashboardStats,
    RecentExams,
    RecentStudents,
    QuickActions,
} from '@/app/(protected)/(instructor)/dashboard/_components';
import { Separator } from '@sentinel/ui';
import { useProfileQuery } from '@sentinel/hooks';

export default function ProctorDashboardPage() {
    const { profile, isLoading } = useProfileQuery();
    const { stats, recentExams, recentStudents } = useProctorDashboard();

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-64px)]">
                Loading dashboard...
            </div>
        );
    }

    const profileName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
        : '';
    const displayName = profileName || profile?.email || 'there';

    return (
        <DashboardShell>
            <DashboardGreeting fullName={displayName} />
            <Separator className="my-6" />

            <div className="space-y-6">
                {/* Stats Grid */}
                <DashboardStats stats={stats} />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    {/* Main Content - Left Column */}
                    <div className="space-y-6 xl:col-span-2">
                        <RecentExams exams={recentExams} />
                        <RecentStudents students={recentStudents} />
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        <QuickActions />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
