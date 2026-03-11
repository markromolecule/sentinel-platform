import {
    LayoutDashboard,
    Calendar,
    Building2,
    BookOpen,
    Layers,
    Users,
    ClipboardList,
    UserCheck,
    BarChart3,
    FileText,
    MessageSquare,
    Megaphone,
} from 'lucide-react';

export const DASHBOARD_ITEMS = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Calendar',
        url: '/admin/calendar',
        icon: Calendar,
    },
];

export const MANAGEMENT_ITEMS = [
    {
        title: 'Department Management',
        url: '/admin/departments',
        icon: Building2,
    },
    {
        title: 'Course Management',
        url: '/admin/courses',
        icon: BookOpen,
    },
    {
        title: 'Section Management',
        url: '/admin/sections',
        icon: Layers,
    },
    {
        title: 'Subject Management',
        url: '/admin/subjects',
        icon: BookOpen,
    },
    {
        title: 'User Management',
        url: '/admin/users',
        icon: Users,
        subItems: [
            {
                title: 'Students',
                url: '/admin/users/students',
            },
            {
                title: 'Proctors',
                url: '/admin/users/proctors',
            },
        ],
    },
    {
        title: 'Exam Management',
        url: '/admin/exams',
        icon: ClipboardList,
    },
    {
        title: 'Proctor Assignment',
        url: '/admin/proctor/assignment',
        icon: UserCheck,
    },
];

export const ANALYTICS_ITEMS = [
    {
        title: 'Reports & Analytics',
        url: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'System Logs',
        url: '/admin/logs',
        icon: FileText,
    },
];

export const COMMUNICATION_ITEMS = [
    {
        title: 'Messages',
        url: '/admin/messages',
        icon: MessageSquare,
    },
    {
        title: 'Announcements',
        url: '/admin/announcements',
        icon: Megaphone,
    },
];
