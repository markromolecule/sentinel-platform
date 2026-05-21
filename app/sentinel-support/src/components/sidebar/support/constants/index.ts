import {
    LucideIcon,
    Activity,
    LayoutDashboard,
    School2,
    Building2,
    CalendarDays,
    Users,
    ShieldCheck,
    DoorOpen,
    BookOpen,
    Layers3,
    Library,
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
        title: 'Courses',
        url: '/courses',
        icon: Library,
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
                title: 'Subject Classifications',
                url: '/subjects/classifications',
            },
            {
                title: 'Offered Subjects',
                url: '/subjects/offered',
            },
        ],
    },
    {
        title: 'Sections',
        url: '/sections',
        icon: Layers3,
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
        title: 'Identity & Access',
        url: '/users',
        icon: Users,
        subItems: [
            {
                title: 'Dean Management',
                url: '/users/dean',
            },
            {
                title: 'Support Management',
                url: '/users/support',
            },
            {
                title: 'Student Whitelist',
                url: '/users/whitelist',
            },
        ],
    },
];

export const CONFIGURATION_ITEMS: SidebarItem[] = [
    {
        title: 'Access Control',
        url: '/control',
        icon: ShieldCheck,
    },
    {
        title: 'Telemetry',
        url: '/telemetry',
        icon: Activity,
    },
];

export const ANALYTICS_ITEMS: SidebarItem[] = [];

export const COMMUNICATION_ITEMS: SidebarItem[] = [
    {
        title: 'Calendar',
        url: '/calendar',
        icon: CalendarDays,
    },
];
