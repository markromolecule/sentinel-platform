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
    Database,
    Library,
    LayoutGrid,
    School,
    BarChart3,
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

export const managementItems = [
    {
        title: 'Subjects',
        url: '/subjects',
        icon: BookOpen,
        children: [
            {
                title: 'All Subjects',
                url: '/subjects',
            },
            {
                title: 'Offered Subjects',
                url: '/subjects/offered',
            },
        ],
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
    {
        title: 'Exams',
        url: '/exams',
        icon: FileText,
        children: [
            {
                title: 'Assign',
                url: '/exams?view=assign',
                icon: UserCheck,
            },
            {
                title: 'Grade',
                url: '/exams?view=grade',
                icon: ClipboardCheck,
            },
        ],
    },
    {
        title: 'Question Bank',
        url: '/question/bank',
        icon: Database,
        children: [
            {
                title: 'All Questions',
                url: '/question/bank',
                icon: Library,
            },
            {
                title: 'Collections',
                url: '/question/bank/collections',
                icon: LayoutGrid,
            },
            {
                title: 'TOS Matrix',
                url: '/question/bank/tos',
                icon: BarChart3,
            },
        ],
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
