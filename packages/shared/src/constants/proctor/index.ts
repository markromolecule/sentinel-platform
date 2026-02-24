import type { ProctorInfo, Student, ProctorExam, NavigationItem } from '../../types/proctor';
import type { Announcement } from '../../types';
import {
    MOCK_ADMIN_USERS,
    MOCK_ANNOUNCEMENTS as SHARED_ANNOUNCEMENTS,
    MOCK_MASTER_SUBJECTS,
    MOCK_SECTIONS as SHARED_SECTIONS,
    MOCK_ACTIVE_SESSIONS as SHARED_ACTIVE_SESSIONS,
    MOCK_FLAGGED_INCIDENTS as SHARED_FLAGGED_INCIDENTS,
    MOCK_EXAM_COMPLETION_DATA as SHARED_EXAM_COMPLETION_DATA,
    MOCK_INCIDENT_TRENDS as SHARED_INCIDENT_TRENDS,
    INCIDENT_LABELS as SHARED_INCIDENT_LABELS,
    MOCK_ADMIN_EVENTS as SHARED_ADMIN_EVENTS,
} from '../../mock-data';

// Mock proctor information
const proctorUser = MOCK_ADMIN_USERS.find((u) => u.role === 'proctor') || MOCK_ADMIN_USERS[1];
export const MOCK_PROCTOR: ProctorInfo = {
    id: proctorUser.id,
    firstName: proctorUser.firstName || '',
    lastName: proctorUser.lastName || '',
    name: `${proctorUser.firstName || ''} ${proctorUser.lastName || ''}`,
    email: proctorUser.email,
    department: proctorUser.department || 'College of Computer Studies',
    institution: 'NU DASMARIÑAS',
};

// Mock students data
export const MOCK_STUDENTS: Student[] = MOCK_ADMIN_USERS.filter((u) => u.role === 'student').map(
    (u) => ({
        id: u.id,
        userId: u.id, // Using same ID for userId in this mock mapping
        role: 'student',
        status: u.status,
        studentNo: u.studentNo || '2024-00000',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        section: 'BSCS-3A', // Default as it's not in AdminUser
        subject: 'Data Structures', // Default
        term: '1st Semester 2025-2026',
        email: u.email,
        enrolledAt: '2026-01-15',
        yearLevel: '3rd Year',
    }),
);

// Mock exams data (Keeping local for now as it has specific fields)
export const MOCK_PROCTOR_EXAMS: ProctorExam[] = [
    {
        id: '1',
        title: 'Data Structures Midterm',
        description: 'Comprehensive midterm examination covering arrays, linked lists, and trees',
        subject: 'Data Structures',
        duration: 120,
        questionCount: 50,
        passingScore: 70,
        scheduledDate: '2026-02-01',
        status: 'active',
        studentsCount: 45,
        createdAt: '2026-01-20',
        createdBy: 'Maria Santos',
    },
    {
        id: '2',
        title: 'Web Development Quiz 1',
        description: 'Quiz on HTML and CSS fundamentals',
        subject: 'Web Development',
        duration: 45,
        questionCount: 20,
        passingScore: 60,
        status: 'draft',
        studentsCount: 0,
        createdAt: '2026-01-25',
        createdBy: 'Maria Santos',
    },
    {
        id: '3',
        title: 'Programming Fundamentals Final',
        description: 'Final examination for programming fundamentals course',
        subject: 'Programming Fundamentals',
        duration: 180,
        questionCount: 75,
        passingScore: 65,
        scheduledDate: '2026-01-10',
        status: 'completed',
        studentsCount: 52,
        createdAt: '2026-01-05',
        createdBy: 'Juan Dela Cruz',
    },
];

// Navigation items for proctor sidebar
export const PROCTOR_NAV_ITEMS: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: '/proctor/dashboard',
        icon: 'LayoutDashboard',
    },
    {
        label: 'Students',
        href: '/proctor/students',
        icon: 'Users',
    },
    {
        label: 'Exams',
        href: '/proctor/exams',
        icon: 'FileText',
    },
    {
        label: 'Messages',
        href: '/proctor/messages',
        icon: 'MessageSquare',
    },
    {
        label: 'Announcements',
        href: '/proctor/announcements',
        icon: 'Megaphone',
    },
];

// Mock announcements
export const MOCK_ANNOUNCEMENTS: Announcement[] = SHARED_ANNOUNCEMENTS;

// Dashboard statistics
export const MOCK_DASHBOARD_STATS = {
    totalStudents: MOCK_STUDENTS.length,
    activeExams: MOCK_PROCTOR_EXAMS.filter((e) => e.status === 'active').length,
    examsToday: 1,
    unreadMessages: 5,
};

// Mock available subjects (Admin managed)
export const MOCK_AVAILABLE_SUBJECTS = MOCK_MASTER_SUBJECTS.map((s) => ({
    code: s.code,
    title: s.title,
    department: s.department,
}));

export const MOCK_SECTIONS = SHARED_SECTIONS.map((s) => s.name);

// Exports for Dashboard components reusing shared data
export const MOCK_ACTIVE_SESSIONS = SHARED_ACTIVE_SESSIONS;
export const MOCK_FLAGGED_INCIDENTS = SHARED_FLAGGED_INCIDENTS;
export const MOCK_EXAM_COMPLETION_DATA = SHARED_EXAM_COMPLETION_DATA;
export const MOCK_INCIDENT_TRENDS = SHARED_INCIDENT_TRENDS;
export const INCIDENT_LABELS = SHARED_INCIDENT_LABELS;
export const MOCK_ADMIN_EVENTS = SHARED_ADMIN_EVENTS;
