import {
    LayoutDashboard,
    Calendar,
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
        title: 'Overview',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Calendar',
        url: '/calendar',
        icon: Calendar,
    },
];

export const MANAGEMENT_ITEMS = [
    {
        title: 'Sections',
        url: '/sections',
        icon: Layers,
    },
    {
        title: 'Subjects',
        url: '/subjects',
        icon: BookOpen,
        subItems: [
            {
                title: 'Subject List',
                url: '/subjects',
            },
            {
                title: 'Offered Subjects',
                url: '/subjects/offered',
            },
            {
                title: 'Enrollment Requests',
                url: '/subjects/requests',
            },
        ],
    },
    {
        title: 'Users',
        url: '/users',
        icon: Users,
        subItems: [
            {
                title: 'Students',
                url: '/users/students',
            },
            {
                title: 'Whitelist',
                url: '/users/whitelist',
            },
            {
                title: 'Proctors',
                url: '/users/proctors',
            },
        ],
    },
    {
        title: 'Exams',
        url: '/exams',
        icon: ClipboardList,
    },
    {
        title: 'Proctor Assignment',
        url: '/proctor/assignment',
        icon: UserCheck,
    },
];

export const ANALYTICS_ITEMS = [
    {
        title: 'Reports & Analytics',
        url: '/analytics',
        icon: BarChart3,
    },
    {
        title: 'System Logs',
        url: '/logs',
        icon: FileText,
    },
];

export const COMMUNICATION_ITEMS = [
    {
        title: 'Messages',
        url: '/messages',
        icon: MessageSquare,
    },
    {
        title: 'Announcements',
        url: '/announcements',
        icon: Megaphone,
    },
];
