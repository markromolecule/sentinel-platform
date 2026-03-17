"use client";

import { useProctorDashboard } from "@/app/(protected)/(proctor)/dashboard/_hooks/use-proctor-dashboard";
import { PageHeader } from "@/components/common/page-header";
import { DashboardStats } from "@/app/(protected)/(proctor)/dashboard/_components/dashboard-stats";
import { QuickActions } from "@/app/(protected)/(proctor)/dashboard/_components/quick-actions";
import { RecentExams } from "@/app/(protected)/(proctor)/dashboard/_components/recent-exams";
import { RecentStudents } from "@/app/(protected)/(proctor)/dashboard/_components/recent-students";
import { AnnouncementsWidget } from "@/app/(protected)/(proctor)/dashboard/_components/announcements-widget";
import { MOCK_ANNOUNCEMENTS } from '@sentinel/shared/constants';

export default function ProctorDashboardPage() {
    const { stats, recentExams, recentStudents } = useProctorDashboard();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's an overview of your proctoring activities."
            />

            {/* Stats Grid */}
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <RecentExams exams={recentExams} />
                    <RecentStudents students={recentStudents} />
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    <QuickActions />
                    <AnnouncementsWidget announcements={MOCK_ANNOUNCEMENTS} />
                </div>
            </div>
        </div>
    );
}

