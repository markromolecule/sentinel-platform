'use client';

import { useProctorDashboard } from '@/app/(protected)/(instructor)/dashboard/_hooks/use-proctor-dashboard';
import {
    DashboardShell,
    DashboardGreeting,
    DashboardStats,
    ExamsActivityOverview,
    QuickAccess,
} from '@/app/(protected)/(instructor)/dashboard/_components';
import { Separator, Spinner } from '@sentinel/ui';
import { useProfileQuery } from '@sentinel/hooks';

export default function ProctorDashboardPage() {
    const { profile, isLoading: isLoadingProfile } = useProfileQuery();
    const { stats, recentExams, isLoading: isLoadingDashboard } = useProctorDashboard();

    const isLoading = isLoadingProfile || isLoadingDashboard;

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] flex-1 items-center justify-center">
                <Spinner className="text-primary size-8" />
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_auto_1fr] xl:gap-8">
                    {/* Main Content - Left Column */}
                    <div className="space-y-6">
                        <ExamsActivityOverview exams={recentExams} />
                    </div>

                    {/* Separator */}
                    <Separator orientation="horizontal" className="xl:hidden" />
                    <Separator orientation="vertical" className="hidden xl:block" />

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">
                        <QuickAccess />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
