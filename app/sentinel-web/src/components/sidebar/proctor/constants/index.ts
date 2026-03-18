import {
    LayoutDashboard,
    Calendar,
    HelpCircle,
    BookOpen,
    Users,
    FileText,
    UserCheck,
    ClipboardCheck,
    MessageSquare,
    Megaphone,
} from 'lucide-react';

export const overviewItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Calendar',
        url: '/calendar',
        icon: Calendar,
    },
];

export const supportItems = [
    {
        title: 'Guide',
        url: '/guide',
        icon: HelpCircle,
    },
];

export const managementItems = [
    {
        title: 'Subjects',
        url: '/subjects',
        icon: BookOpen,
    },
    {
        title: 'Students',
        url: '/students',
        icon: Users,
    },
    {
        title: 'Exams',
        url: '/exams',
        icon: FileText,
        children: [
            {
                title: 'Assign',
                url: '/exams?view=assign',
            },
        ],
    },
    {
        title: 'Proctor Assignment',
        url: '/assignment',
        icon: UserCheck,
    },
    {
        title: 'Grading',
        url: '/grading',
        icon: ClipboardCheck,
    },
];

export const communicationItems = [
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
