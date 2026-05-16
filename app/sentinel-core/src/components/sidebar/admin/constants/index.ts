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
    LayoutGrid,
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
                title: 'Instructors',
                url: '/users/instructors',
            },
            {
                title: 'Whitelist',
                url: '/users/whitelist',
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
    {
        title: 'Portal Access',
        url: '#',
        icon: LayoutGrid,
        subItems: [
            {
                title: 'Superadmin Dashboard',
                url: '/superadmin',
            },
            {
                title: 'Support Portal',
                url: '/support',
            },
        ],
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
