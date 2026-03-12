import {
    LucideIcon,
    LayoutDashboard,
    Calendar,
    Building2,
    BarChart3,
    FileText,
    MessageSquare,
    Megaphone,
    Users,
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
        title: 'Dashboard',
        url: '/superadmin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Calendar',
        url: '/superadmin/calendar',
        icon: Calendar,
    },
];

export const MANAGEMENT_ITEMS: SidebarItem[] = [
    {
        title: 'Institution Management',
        url: '/superadmin/institutions',
        icon: Building2,
    },
    {
        title: 'Administrator Management',
        url: '/superadmin/administrators',
        icon: Users,
    },
];

export const ANALYTICS_ITEMS: SidebarItem[] = [
    {
        title: 'Reports & Analytics',
        url: '/superadmin/analytics',
        icon: BarChart3,
    },
    {
        title: 'System Logs',
        url: '/superadmin/logs',
        icon: FileText,
    },
];

export const COMMUNICATION_ITEMS: SidebarItem[] = [
    {
        title: 'Messages',
        url: '/superadmin/messages',
        icon: MessageSquare,
    },
    {
        title: 'Announcements',
        url: '/superadmin/announcements',
        icon: Megaphone,
    },
];

