'use client';

import {
    DashboardShell,
    DashboardGreeting,
    KpiCarouselWidget,
    AdminShortcutsWidget,
} from '@/app/(protected)/dashboard/_components';
import { Separator, Spinner } from '@sentinel/ui';
import { useUser } from '@/hooks/use-user';
import {
    useProfileQuery,
    useUsersQuery,
    useClassroomsQuery,
    useSectionsQuery,
    useCoursesQuery,
    useStudentWhitelistQuery,
} from '@sentinel/hooks';
import { useAcademicScope } from '@/hooks/use-academic-scope';

/**
 * Dashboard is the main entrance dashboard for administrators and superadministrators.
 * It resolves the user's academic scope (department or course limits) and fetches
 * the corresponding scoped metrics to display in the KPI cards.
 */
export default function DashboardPage() {
    const { data: user, isLoading: isUserLoading } = useUser();
    const { profile, isLoading: isProfileLoading } = useProfileQuery();
    const {
        isSuperadmin,
        isAdmin,
        assignedDepartmentId,
        assignedCourseId,
        institutionId,
        isLoading: isAcademicScopeLoading,
    } = useAcademicScope();

    // Query students within department or course scope
    const { data: students = [], isLoading: isStudentsLoading } = useUsersQuery({
        role: 'student',
        departmentId: isSuperadmin ? assignedDepartmentId : undefined,
        institutionId: institutionId || undefined,
        enabled: (isSuperadmin && !!assignedDepartmentId) || (isAdmin && !!institutionId),
    });

    // Query classrooms within department scope
    const { data: classrooms = [], isLoading: isClassroomsLoading } = useClassroomsQuery({
        departmentId: isSuperadmin ? assignedDepartmentId : undefined,
        institutionId: institutionId || undefined,
        enabled: isSuperadmin && !!assignedDepartmentId,
    });

    // Query programs (courses) within department scope
    const { data: courses = [], isLoading: isCoursesLoading } = useCoursesQuery({
        departmentId: isSuperadmin ? assignedDepartmentId : undefined,
        institutionId: institutionId || undefined,
        enabled: isSuperadmin && !!assignedDepartmentId,
    });

    // Query sections within course scope for admin, or all for superadmin (to filter)
    const { data: sections = [], isLoading: isSectionsLoading } = useSectionsQuery({
        institutionId: institutionId || undefined,
        courseId: isAdmin ? assignedCourseId : undefined,
        enabled: (isSuperadmin && !!institutionId) || (isAdmin && !!assignedCourseId),
    });

    // Query student whitelist within department scope for superadmin, or course scope for admin
    const { data: whitelist = [], isLoading: isWhitelistLoading } = useStudentWhitelistQuery({
        department_id: isSuperadmin ? assignedDepartmentId : undefined,
        course_id: isAdmin ? assignedCourseId : undefined,
        institution_id: institutionId || undefined,
    });

    const isDataLoading =
        (isSuperadmin &&
            (isStudentsLoading ||
                isClassroomsLoading ||
                isCoursesLoading ||
                isSectionsLoading ||
                isWhitelistLoading)) ||
        (isAdmin && (isStudentsLoading || isSectionsLoading || isWhitelistLoading));

    if (isUserLoading || isProfileLoading || isAcademicScopeLoading || isDataLoading) {
        return (
            <div className="flex h-96 flex-1 items-center justify-center">
                <Spinner className="text-primary size-8" />
            </div>
        );
    }

    const profileName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
        : '';
    const displayName =
        profileName ||
        (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'there');

    const kpiCards = isSuperadmin
        ? [
              {
                  id: 'students',
                  label: 'Students',
                  value: students.filter((s) => s.departmentId === assignedDepartmentId).length,
                  description: 'Total students in department',
              },
              {
                  id: 'classrooms',
                  label: 'Classrooms',
                  value: classrooms.filter((c) => c.departmentId === assignedDepartmentId).length,
                  description: 'Active classrooms in department',
              },
              {
                  id: 'sections',
                  label: 'Sections',
                  value: sections.filter((s) => s.departmentId === assignedDepartmentId).length,
                  description: 'Class sections in department',
              },
              {
                  id: 'programs',
                  label: 'Programs',
                  value: courses.filter((c) => c.departmentId === assignedDepartmentId).length,
                  description: 'Academic programs in department',
              },
              {
                  id: 'whitelist',
                  label: 'Whitelist Accounts',
                  value: whitelist.filter((w) => w.departmentId === assignedDepartmentId).length,
                  description: 'Total whitelisted students in department',
              },
          ]
        : isAdmin
          ? [
                {
                    id: 'students',
                    label: 'Students',
                    value: students.filter((s) => s.courseId === assignedCourseId).length,
                    description: 'Total students in program',
                },
                {
                    id: 'sections',
                    label: 'Sections',
                    value: sections.filter((s) => s.courseId === assignedCourseId).length,
                    description: 'Class sections in program',
                },
                {
                    id: 'whitelist',
                    label: 'Whitelist Accounts',
                    value: whitelist.filter((w) => w.courseId === assignedCourseId).length,
                    description: 'Total whitelisted students in program',
                },
            ]
          : [];

    return (
        <DashboardShell>
            <DashboardGreeting fullName={displayName} />
            <Separator className="my-6" />
            <div className="flex flex-col gap-8">
                {/* KPI Cards Overview */}
                {kpiCards.length > 0 && <KpiCarouselWidget cards={kpiCards} />}

                {/* Administration Shortcuts */}
                <AdminShortcutsWidget />
            </div>
        </DashboardShell>
    );
}
