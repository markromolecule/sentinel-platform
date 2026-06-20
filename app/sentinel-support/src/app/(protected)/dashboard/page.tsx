'use client';

import {
    ActiveSessionsWidget,
    AdminStatsCards,
    DashboardGreeting,
    DashboardShell,
    FlaggedIncidentsWidget,
    KpiCarouselWidget,
    SystemHealth,
    SupportShortcutsWidget,
} from '@/app/(protected)/dashboard/_components';

import { useUser } from '@/hooks/use-user';
import {
    useInstitutionsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useRoomsQuery,
    useSubjectsQuery,
    useSectionsQuery,
    useProfileQuery,
    useStudentWhitelistQuery,
} from '@sentinel/hooks';
import { MOCK_RECENT_ACTIVITY, MOCK_SYSTEM_STATS } from '@sentinel/shared/constants';
import { PageHeader, Separator, Spinner } from '@sentinel/ui';

export default function DashboardPage() {
    const { data: user, isLoading: isUserLoading } = useUser();
    const { profile, isLoading: isProfileLoading } = useProfileQuery();

    const { data: institutions = [] } = useInstitutionsQuery();
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: rooms = [] } = useRoomsQuery();
    const { data: subjects = [] } = useSubjectsQuery();
    const { data: sections = [] } = useSectionsQuery();
    const { data: whitelist = [] } = useStudentWhitelistQuery();

    if (isUserLoading || isProfileLoading) {
        return (
            <div className="flex h-96 flex-1 items-center justify-center">
                <Spinner className="text-primary size-8" />
            </div>
        );
    }

    const role = user?.user_metadata?.role;

    const supportKpiCards = [
        {
            id: 'institutions',
            label: 'Institution',
            value: institutions.length,
            description: 'Registered institutions',
        },
        {
            id: 'departments',
            label: 'Departments',
            value: departments.length,
            description: 'Academic departments',
        },
        {
            id: 'programs',
            label: 'Programs',
            value: courses.length,
            description: 'Academic programs',
        },
        {
            id: 'rooms',
            label: 'Rooms',
            value: rooms.length,
            description: 'Exam venues/rooms',
        },
        {
            id: 'subjects',
            label: 'Subjects',
            value: subjects.length,
            description: 'Course subjects',
        },
        {
            id: 'sections',
            label: 'Sections',
            value: sections.length,
            description: 'Class sections',
        },
        {
            id: 'whitelist',
            label: 'Whitelist Accounts',
            value: whitelist.length,
            description: 'Whitelisted student accounts',
        },
    ];

    if (role === 'support') {
        const profileName = profile
            ? [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
            : '';
        const displayName =
            profileName ||
            (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'there');
        return (
            <DashboardShell>
                <DashboardGreeting fullName={displayName} />
                <Separator className="my-6" />
                <div className="flex flex-col gap-8">
                    {/* KPI Cards Overview */}
                    <KpiCarouselWidget cards={supportKpiCards} />

                    {/* Operational Shortcuts */}
                    <SupportShortcutsWidget />
                </div>
            </DashboardShell>
        );
    }

    // Default to Admin Dashboard
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
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
