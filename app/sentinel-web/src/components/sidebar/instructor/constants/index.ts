import {
    LayoutDashboard,
    Calendar,
    HelpCircle,
    BookOpen,
    Users,
    FileText,
    MessageSquare,
    Megaphone,
    Database,
    School,
} from 'lucide-react';

export const overviewItems = [
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

export const supportItems = [
    {
        title: 'Guide',
        url: '/guide',
        icon: HelpCircle,
    },
];

export const studentManagementItems = [
    {
        title: 'Subjects',
        url: '/subjects',
        icon: BookOpen,
    },
    {
        title: 'Classrooms',
        url: '/classrooms',
        icon: School,
    },
    {
        title: 'Students',
        url: '/students',
        icon: Users,
    },
];

export const examManagementItems = [
    {
        title: 'Exams',
        url: '/exams',
        icon: FileText,
    },
    {
        title: 'Question Bank',
        url: '/question/bank',
        icon: Database,
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
