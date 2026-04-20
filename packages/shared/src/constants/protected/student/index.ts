import { Home, History, MessageSquare, Calendar, BookOpen } from 'lucide-react';

// Bottom Navigation Items
export const BOTTOM_NAV_ITEMS = [
    { label: 'Classrooms', href: '/student/classroom', icon: BookOpen },
    { label: 'Exams', href: '/student/exam', icon: History },
    { label: 'Calendar', href: '/student/calendar', icon: Calendar },
    { label: 'Messages', href: '/student/message', icon: MessageSquare },
] as const;

// Header Navigation Items
export const HEADER_NAV_ITEMS = [
    { label: 'Classrooms', href: '/student/classroom', icon: BookOpen },
    { label: 'Exams', href: '/student/exam', icon: History },
    { label: 'Calendar', href: '/student/calendar', icon: Calendar },
    { label: 'Messages', href: '/student/message', icon: MessageSquare },
] as const;

// Cheating Report Props
export interface CheatingReportProps {
    cheated?: boolean;
    cheatingType?: string;
}
