import {
    LucideIcon,
    LayoutDashboard,
    Calendar,
    Building2,
    BookOpen,
    BarChart3,
    FileText,
    MessageSquare,
    Megaphone,
    Users,
    School2,
} from 'lucide-react';

export interface SubItem {
    title: string;
    url: string;
}

export interface SidebarItem {
    title: string;
    url: string;
    icon: LucideIcon;
    subItems?: SubItem[];
}

export const DASHBOARD_ITEMS: SidebarItem[] = [
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

export const MANAGEMENT_ITEMS: SidebarItem[] = [
    {
        title: 'Institutions',
        url: '/institutions',
        icon: School2,
    },
    {
        title: 'Departments',
        url: '/departments',
        icon: Building2,
    },
    {
        title: 'Courses',
        url: '/courses',
        icon: BookOpen,
    },
    {
        title: 'Access Management',
        url: '/administrators',
        icon: Users,
        subItems: [
            {
                title: 'Administrators',
                url: '/administrators',
            },
            {
                title: 'Permissions',
                url: '/permissions',
            },
        ],
    },
];

export const ANALYTICS_ITEMS: SidebarItem[] = [
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

export const COMMUNICATION_ITEMS: SidebarItem[] = [
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
