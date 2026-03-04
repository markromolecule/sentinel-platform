"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_ADMIN_EVENTS = exports.INCIDENT_LABELS = exports.MOCK_INCIDENT_TRENDS = exports.MOCK_EXAM_COMPLETION_DATA = exports.MOCK_FLAGGED_INCIDENTS = exports.MOCK_ACTIVE_SESSIONS = exports.MOCK_SECTIONS = exports.MOCK_AVAILABLE_SUBJECTS = exports.MOCK_DASHBOARD_STATS = exports.MOCK_ANNOUNCEMENTS = exports.PROCTOR_NAV_ITEMS = exports.MOCK_PROCTOR_EXAMS = exports.MOCK_STUDENTS = exports.MOCK_PROCTOR = void 0;
const mock_data_1 = require("../../mock-data");
// Mock proctor information
const proctorUser = mock_data_1.MOCK_ADMIN_USERS.find((u) => u.role === 'proctor') || mock_data_1.MOCK_ADMIN_USERS[1];
exports.MOCK_PROCTOR = {
    id: proctorUser.id,
    firstName: proctorUser.firstName || '',
    lastName: proctorUser.lastName || '',
    name: `${proctorUser.firstName || ''} ${proctorUser.lastName || ''}`,
    email: proctorUser.email,
    department: proctorUser.department || 'College of Computer Studies',
    institution: 'NU DASMARIÑAS',
};
// Mock students data
exports.MOCK_STUDENTS = mock_data_1.MOCK_ADMIN_USERS.filter((u) => u.role === 'student').map((u) => ({
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
}));
// Mock exams data (Keeping local for now as it has specific fields)
exports.MOCK_PROCTOR_EXAMS = [
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
exports.PROCTOR_NAV_ITEMS = [
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
exports.MOCK_ANNOUNCEMENTS = mock_data_1.MOCK_ANNOUNCEMENTS;
// Dashboard statistics
exports.MOCK_DASHBOARD_STATS = {
    totalStudents: exports.MOCK_STUDENTS.length,
    activeExams: exports.MOCK_PROCTOR_EXAMS.filter((e) => e.status === 'active').length,
    examsToday: 1,
    unreadMessages: 5,
};
// Mock available subjects (Admin managed)
exports.MOCK_AVAILABLE_SUBJECTS = mock_data_1.MOCK_MASTER_SUBJECTS.map((s) => ({
    code: s.code,
    title: s.title,
    department: s.department,
}));
exports.MOCK_SECTIONS = mock_data_1.MOCK_SECTIONS.map((s) => s.name);
// Exports for Dashboard components reusing shared data
exports.MOCK_ACTIVE_SESSIONS = mock_data_1.MOCK_ACTIVE_SESSIONS;
exports.MOCK_FLAGGED_INCIDENTS = mock_data_1.MOCK_FLAGGED_INCIDENTS;
exports.MOCK_EXAM_COMPLETION_DATA = mock_data_1.MOCK_EXAM_COMPLETION_DATA;
exports.MOCK_INCIDENT_TRENDS = mock_data_1.MOCK_INCIDENT_TRENDS;
exports.INCIDENT_LABELS = mock_data_1.INCIDENT_LABELS;
exports.MOCK_ADMIN_EVENTS = mock_data_1.MOCK_ADMIN_EVENTS;
//# sourceMappingURL=index.js.map