import {
    LucideIcon,
    LayoutDashboard,
    School2,
    Building2,
    CalendarDays,
    Users,
    ShieldCheck,
    DoorOpen,
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
        title: 'Rooms',
        url: '/rooms',
        icon: DoorOpen,
    },
];

export const USER_MANAGEMENT_ITEMS: SidebarItem[] = [
    {
        title: 'Administrators',
        url: '/users',
        icon: Users,
    },
];

export const CONFIGURATION_ITEMS: SidebarItem[] = [
    {
        title: 'Access Control',
        url: '/access-control',
        icon: ShieldCheck,
    },
];

export const ANALYTICS_ITEMS: SidebarItem[] = [];

export const COMMUNICATION_ITEMS: SidebarItem[] = [];
