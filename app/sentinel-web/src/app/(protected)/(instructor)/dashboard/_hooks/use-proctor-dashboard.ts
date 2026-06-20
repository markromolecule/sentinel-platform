import { Users, FileText, BookOpen, School } from 'lucide-react';
import { useInstructorDashboardQuery } from '@sentinel/hooks';
import { DashboardStat } from '@sentinel/shared/types';

/**
 * Custom hook to fetch and map instructor dashboard metrics.
 *
 * @returns Dashboard stats, recent exams, loading status, and error states
 */
export function useProctorDashboard() {
    const { data, isLoading, isError, error } = useInstructorDashboardQuery();

    const stats: DashboardStat[] = [
        {
            label: 'Total Students',
            value: data?.stats.totalStudents ?? 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            href: '/students',
        },
        {
            label: 'Total Classrooms',
            value: data?.stats.totalClassrooms ?? 0,
            icon: School,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            href: '/classrooms',
        },
        {
            label: 'Enrolled Subjects',
            value: data?.stats.totalSubjects ?? 0,
            icon: BookOpen,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            href: '/subjects',
        },
        {
            label: 'Exams Created',
            value: data?.stats.examsCreated ?? 0,
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            href: '/exams',
        },
    ];

    return {
        stats,
        recentExams: data?.recentExams ?? [],
        isLoading,
        isError,
        error,
    };
}
