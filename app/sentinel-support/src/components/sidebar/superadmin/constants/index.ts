import {
    LucideIcon,
    LayoutDashboard,
    School2,
    Building2,
    CalendarDays,
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
        title: 'Overview',
        url: '/dashboard',
        icon: LayoutDashboard,
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
        title: 'Semesters',
        url: '/semesters',
        icon: CalendarDays,
    },
    {
        title: 'Administrators',
        url: '/users',
        icon: Users,
    },
];

export const ANALYTICS_ITEMS: SidebarItem[] = [];

export const COMMUNICATION_ITEMS: SidebarItem[] = [];
