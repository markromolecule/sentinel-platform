import {
    User,
    AdminUser,
    SystemStat,
    Activity,
    ExamConfig,
    InstructorAssignment,
    AnalyticsReport,
    AuditLog,
    Announcement,
    FlaggedIncident,
    AdminEvent,
    Section,
    ChatUser,
    Conversation,
    Message,
    Course,
    MasterSubject,
    Subject,
    ActiveSession,
    Institution,
} from '../types';

type MockUser = User & { studentNo?: string };

// Admin Users
export const MOCK_ADMIN_USERS: MockUser[] = [
    {
        id: 'USR-001',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah.connor@sentinel.edu',
        role: 'admin',
        status: 'active',
        department: 'IT Security',
    },
    {
        id: 'USR-002',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@sentinel.edu',
        role: 'proctor',
        status: 'active',
        department: 'Computer Science',
    },
    {
        id: 'USR-003',
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@sentinel.edu',
        role: 'instructor',
        status: 'active',
        department: 'Engineering',
    },
    {
        id: 'USR-004',
        firstName: 'Michael',
        lastName: 'Smith',
        email: 'michael.smith@sentinel.edu',
        role: 'proctor',
        status: 'inactive',
        department: 'Mathematics',
    },
    {
        id: 'USR-005',
        firstName: 'Jessica',
        lastName: 'Brown',
        email: 'jessica.brown@sentinel.edu',
        role: 'instructor',
        status: 'suspended',
        department: 'Physics',
    },
    {
        id: 'STU-001',
        firstName: 'Alex',
        lastName: 'Turner',
        email: 'alex.turner@student.sentinel.edu',
        role: 'student',
        status: 'active',
        studentNo: '2024-00123',
        createdAt: '2024-01-15',
    },
    {
        id: 'STU-002',
        firstName: 'Jamie',
        lastName: 'Cook',
        email: 'jamie.cook@student.sentinel.edu',
        role: 'student',
        status: 'suspended',
        studentNo: '2024-00456',
        createdAt: '2024-01-15',
    },
];

// System Stats
export const MOCK_SYSTEM_STATS: SystemStat[] = [
    {
        label: 'Total Students',
        value: '2,543',
        change: 8.5,
        trend: 'up',
        description: 'Enrolled this term',
    },
    {
        label: 'Active Proctors',
        value: '42',
        change: 0,
        trend: 'neutral',
        description: 'Currently online',
    },
    {
        label: 'Ongoing Exams',
        value: '18',
        change: 12,
        trend: 'up',
        description: 'Live sessions',
    },
    {
        label: 'Flagged Incidents',
        value: '156',
        change: -5,
        trend: 'down',
        description: 'In the last 24h',
    },
];

// Recent Activity
export const MOCK_RECENT_ACTIVITY: Activity[] = [
    {
        id: 'ACT-001',
        user: 'Sarah Connor',
        action: 'updated global rules',
        target: 'Exam Configuration',
        timestamp: '10 mins ago',
        type: 'warning',
    },
    {
        id: 'ACT-002',
        user: 'John Doe',
        action: 'suspended user',
        target: 'Jamie Cook (Student)',
        timestamp: '45 mins ago',
        type: 'error',
    },
    {
        id: 'ACT-003',
        user: 'System',
        action: 'generated report',
        target: 'Weekly Incident Summary',
        timestamp: '2 hours ago',
        type: 'success',
    },
    {
        id: 'ACT-004',
        user: 'Emily Watson',
        action: 'assigned proctor',
        target: 'Michael Smith -> CS101',
        timestamp: '4 hours ago',
        type: 'info',
    },
];

// Exam Configuration
export const MOCK_EXAM_CONFIG: ExamConfig = {
    id: 'CFG-GLOBAL',
    name: 'Default Strict Policy',
    allowedDevices: ['desktop'],
    cameraRequired: true,
    micRequired: true,
    aiRules: {
        web: {
            gazeTracking: true,
            audioDetection: true,
            tabSwitching: true,
            copyPaste: true,
            printScreenDisable: true,
        },
        mobile: {
            gazeTracking: true,
            audioDetection: true,
            appPinning: true,
            screenshotDisable: true,
        },
    },
    maxReconnectAttempts: 3,
    autoSubmitTimeout: 5,
};

// Instructor Assignments
export const MOCK_PROCTOR_ASSIGNMENTS: InstructorAssignment[] = [
    {
        id: 'ASN-001',
        instructorId: 'USR-002',
        instructorName: 'John Doe',
        examId: 'EXM-101',
        examName: 'Introduction to Computer Science',
        assignedStudents: 120,
        notes: 'No notes',
        status: 'active',
    },
    {
        id: 'ASN-002',
        instructorId: 'USR-004',
        instructorName: 'Michael Smith',
        examId: 'EXM-202',
        examName: 'Advanced Calculus',
        assignedStudents: 45,
        notes: 'No notes',
        status: 'scheduled',
    },
];

// Analytics Reports
export const MOCK_REPORTS: AnalyticsReport[] = [
    {
        id: 'RPT-001',
        title: 'Weekly Incident Summary',
        type: 'incident',
        generatedAt: '2024-10-25 09:00:00',
        format: 'pdf',
        status: 'ready',
    },
    {
        id: 'RPT-002',
        title: 'Exam Completion Rates - Midterm',
        type: 'completion',
        generatedAt: '2024-10-24 14:30:00',
        format: 'csv',
        status: 'ready',
    },
];

// Audit Logs
export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'LOG-001',
        actor: 'admin@sentinel.edu',
        action: 'LOGIN_SUCCESS',
        resourceType: 'Auth',
        resourceId: 'N/A',
        details: 'Successful login from 192.168.1.1',
        timestamp: '2024-10-26 08:00:01',
    },
    {
        id: 'LOG-002',
        actor: 'proctor@sentinel.edu',
        action: 'EXAM_START',
        resourceType: 'Exam',
        resourceId: 'EXM-101',
        details: 'Started monitoring session',
        timestamp: '2024-10-26 09:00:00',
    },
];

// Announcements
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'ANC-001',
        title: 'Scheduled Maintenance',
        content: 'The system will be down for maintenance on Sunday at 2 AM UTC.',
        targetAudience: ['all'],
        status: 'published',
        publishedAt: '2024-10-20 10:00:00',
        author: 'IT Support',
    },
    {
        id: 'ANC-002',
        title: 'New AI Proctoring Rules',
        content: 'Please review the updated guidelines for gaze tracking sensitivity.',
        targetAudience: ['proctors', 'students'],
        status: 'draft',
        author: 'Compliance Team',
    },
];

// Charts Data
export const MOCK_EXAM_COMPLETION_DATA = [
    { name: 'Mon', completed: 40, dropped: 2 },
    { name: 'Tue', completed: 30, dropped: 1 },
    { name: 'Wed', completed: 20, dropped: 3 },
    { name: 'Thu', completed: 27, dropped: 1 },
    { name: 'Fri', completed: 18, dropped: 4 },
    { name: 'Sat', completed: 23, dropped: 2 },
    { name: 'Sun', completed: 34, dropped: 1 },
];

export const MOCK_INCIDENT_TRENDS = [
    { name: 'Week 1', incidents: 12 },
    { name: 'Week 2', incidents: 19 },
    { name: 'Week 3', incidents: 3 },
    { name: 'Week 4', incidents: 5 },
    { name: 'Week 5', incidents: 2 },
];

// Dashboard Flagged Incidents
export const MOCK_FLAGGED_INCIDENTS: FlaggedIncident[] = [
    {
        id: 'INC-001',
        studentName: 'Jamie Cook',
        examName: 'CS101 Midterm',
        incidentType: 'multiple_faces',
        severity: 'high',
        timestamp: '2 mins ago',
        status: 'pending',
    },
    {
        id: 'INC-002',
        studentName: 'Alex Turner',
        examName: 'CS101 Midterm',
        incidentType: 'tab_switch',
        severity: 'medium',
        timestamp: '5 mins ago',
        status: 'pending',
    },
    {
        id: 'INC-003',
        studentName: 'Maria Santos',
        examName: 'Math 201 Final',
        incidentType: 'face_not_visible',
        severity: 'low',
        timestamp: '12 mins ago',
        status: 'reviewed',
    },
    {
        id: 'INC-004',
        studentName: 'James Wilson',
        examName: 'Physics 101',
        incidentType: 'audio_detected',
        severity: 'medium',
        timestamp: '18 mins ago',
        status: 'pending',
    },
];

export const INCIDENT_LABELS: Record<FlaggedIncident['incidentType'], string> = {
    face_not_visible: 'Face Not Visible',
    multiple_faces: 'Multiple Faces Detected',
    tab_switch: 'Tab Switch Detected',
    audio_detected: 'Audio Anomaly',
    suspicious_movement: 'Suspicious Movement',
};

// Calendar Events
const today = new Date();
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const MOCK_ADMIN_EVENTS: AdminEvent[] = [
    {
        id: 'evt-1',
        date: today,
        title: 'System Maintenance',
        description: 'Scheduled maintenance for server upgrades.',
        type: 'maintenance',
        targetAudience: 'all',
        startTime: '22:00',
        endTime: '23:00',
        createdBy: 'admin-1',
    },
    {
        id: 'evt-2',
        date: addDays(today, 2),
        title: 'Proctor Orientation',
        description: 'Mandatory session for new proctors.',
        type: 'event',
        targetAudience: 'proctors',
        startTime: '10:00',
        endTime: '12:00',
        createdBy: 'admin-1',
    },
    {
        id: 'evt-3',
        date: addDays(today, 5),
        title: 'Exam Week Kickoff',
        description: 'Start of the final exam period.',
        type: 'announcement',
        targetAudience: 'students',
        startTime: '09:00',
        createdBy: 'admin-1',
    },
];

// Sections
export const MOCK_SECTIONS: Section[] = [
    {
        id: '1',
        name: 'BSIT-1A',
        departmentId: 'SECA',
        courseId: '1',
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '2',
        name: 'BSIT-1B',
        departmentId: 'SECA',
        courseId: '1',
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '3',
        name: 'BSCS-2A',
        departmentId: 'SECA',
        courseId: '2',
        yearLevel: 2,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '4',
        name: 'BSA-1A',
        departmentId: 'SBMA',
        courseId: '6',
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '5',
        name: 'BSCS-1A',
        departmentId: 'SECA',
        courseId: '2',
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '6',
        name: 'BSCS-1B',
        departmentId: 'SECA',
        courseId: '2',
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '7',
        name: 'BSCE-1A',
        departmentId: 'SECA',
        courseId: '5',
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '8',
        name: 'BSCE-2A',
        departmentId: 'SECA',
        courseId: '5',
        yearLevel: 2,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
    {
        id: '9',
        name: 'BSN-1A',
        departmentId: 'SASE',
        courseId: '10', // Changed to match BS Psychology for now or similar
        yearLevel: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'System Admin',
    },
];

// Chat & Messages

export const MOCK_CHAT_USERS: ChatUser[] = [
    {
        id: 'user-1',
        name: 'Dr. Sarah Admin',
        status: 'online',
        role: 'admin',
        avatar: '/avatars/01.png',
    },
    {
        id: 'user-2',
        name: 'John Proctor',
        status: 'busy',
        role: 'proctor',
        avatar: '/avatars/02.png',
    },
    {
        id: 'user-3',
        name: 'Jane Student',
        status: 'offline',
        role: 'student',
        avatar: '/avatars/03.png',
    },
    {
        id: 'user-4',
        name: 'Mike Tech',
        status: 'online',
        role: 'proctor',
        avatar: '/avatars/04.png',
    },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1',
        participants: [MOCK_CHAT_USERS[1]],
        lastMessage: {
            id: 'msg-1',
            senderId: 'user-2',
            content: 'Can you review the latest exam logs?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            isRead: false,
        },
        unreadCount: 1,
    },
    {
        id: 'conv-2',
        participants: [MOCK_CHAT_USERS[2]],
        lastMessage: {
            id: 'msg-2',
            senderId: 'user-1',
            content: 'Your appeal has been processed.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            isRead: true,
        },
        unreadCount: 0,
    },
    {
        id: 'conv-3',
        participants: [MOCK_CHAT_USERS[3]],
        lastMessage: {
            id: 'msg-3',
            senderId: 'user-4',
            content: 'System maintenance scheduled for tonight.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            isRead: true,
        },
        unreadCount: 0,
    },
];

export const MOCK_MESSAGES: Record<string, any[]> = {
    'conv-1': [
        {
            id: 'm-1',
            senderId: 'user-2',
            content: 'Hi Dr. Sarah, are you available?',
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            isRead: true,
        },
        {
            id: 'm-2',
            senderId: 'user-1',
            content: "Yes, John. What's up?",
            timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
            isRead: true,
        },
        {
            id: 'm-3',
            senderId: 'user-2',
            content: 'Can you review the latest exam logs? I see some anomalies.',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            isRead: false,
        },
    ],
    'conv-2': [
        {
            id: 'm-4',
            senderId: 'user-3',
            content: 'Hello, I wanted to ask about my exam grade.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            isRead: true,
        },
        {
            id: 'm-5',
            senderId: 'user-1',
            content: 'Your appeal has been processed. You should see the update soon.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            isRead: true,
        },
    ],
    'conv-3': [],
};

// Courses
export const MOCK_COURSES: Course[] = [
    // SECA
    {
        id: '1',
        code: 'BSIT-MWA',
        title: 'BS Information Technology with a Specialization in Mobile and Web Applications',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '2',
        code: 'BSCS-ML',
        title: 'BS Computer Science with a Specialization in Machine Learning',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '3',
        code: 'BSARCH',
        title: 'BS Architecture',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '4',
        code: 'BSCpE',
        title: 'BS Computer Engineering',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '5',
        code: 'BSCE',
        title: 'BS Civil Engineering',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    // SBMA
    {
        id: '6',
        code: 'BSA',
        title: 'BS Accountancy',
        department: 'School of Business, Management, and Accountancy',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '7',
        code: 'BSHM',
        title: 'BS Hospitality Management',
        department: 'School of Business, Management, and Accountancy',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '8',
        code: 'BSMA',
        title: 'BS Management Accounting',
        department: 'School of Business, Management, and Accountancy',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '9',
        code: 'BSTM',
        title: 'BS Tourism Management',
        department: 'School of Business, Management, and Accountancy',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    // SASE
    {
        id: '10',
        code: 'BSPSY',
        title: 'BS Psychology',
        department: 'School of Arts, Sciences, and Education',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
    {
        id: '11',
        code: 'BAC',
        title: 'BA Communication',
        department: 'School of Arts, Sciences, and Education',
        createdAt: new Date().toISOString(),
        createdBy: 'System',
    },
];

// Subjects
export const MOCK_SUBJECTS: Subject[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Data Structures and Algorithms',
        code: 'CS201',
        section: 'BSCS-2A',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'Maria Santos',
        instructorId: 'USR-002', // Assigned to John Doe
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Introduction to Computing',
        code: 'CS101',
        section: 'BSCS-1A',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'Juan Dela Cruz',
        instructorId: 'USR-002', // Assigned to John Doe
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'IT Fundamentals',
        code: 'IT101',
        section: 'BSIT-1A',
        department: 'School of Engineering, Computing, and Architecture',
        createdAt: new Date().toISOString(),
        createdBy: 'Maria Santos',
        instructorId: 'USR-002', // Assigned to John Doe
    },
];

export const MOCK_MASTER_SUBJECTS: MasterSubject[] = [
    {
        code: 'CS101',
        title: 'Introduction to Computing',
        department: 'School of Engineering, Computing, and Architecture',
        yearLevel: '1st Year',
        sections: ['BSCS-1A', 'BSCS-1B'],
    },
    {
        code: 'CS102',
        title: 'Computer Programming 1',
        department: 'School of Engineering, Computing, and Architecture',
        yearLevel: '1st Year',
        sections: ['BSCS-1A', 'BSCS-1B'],
    },
    {
        code: 'CS201',
        title: 'Data Structures and Algorithms',
        department: 'School of Engineering, Computing, and Architecture',
        yearLevel: '2nd Year',
        sections: ['BSCS-2A'],
    },
    {
        code: 'IT101',
        title: 'IT Fundamentals',
        department: 'School of Engineering, Computing, and Architecture',
        yearLevel: '1st Year',
        sections: ['BSIT-1A'],
    },
    {
        code: 'MAT101',
        title: 'Calculus I',
        department: 'School of Arts, Sciences, and Education',
        yearLevel: '1st Year',
        sections: ['BSCS-1A', 'BSIT-1A', 'BSCE-1A'],
    },
    {
        code: 'MAT201',
        title: 'Advanced Calculus',
        department: 'School of Arts, Sciences, and Education',
        yearLevel: '2nd Year',
        sections: ['BSCE-2A'],
    },
    {
        code: 'GE101',
        title: 'Understanding the Self',
        department: 'School of Arts, Sciences, and Education',
        yearLevel: '1st Year',
        sections: ['BSCS-1A', 'BSIT-1A', 'BSN-1A'],
    },
];

// Active Sessions (Dashboard)
export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
    {
        id: 'SES-001',
        studentName: 'Alex Turner',
        examName: 'CS101 Midterm',
        proctorName: 'John Doe',
        duration: '45m 12s',
        status: 'live',
    },
    {
        id: 'SES-002',
        studentName: 'Maria Santos',
        examName: 'Math 201 Final',
        proctorName: 'Emily Watson',
        duration: '1h 23m',
        status: 'live',
    },
    {
        id: 'SES-003',
        studentName: 'James Wilson',
        examName: 'Physics 101',
        proctorName: 'John Doe',
        duration: '32m 05s',
        status: 'paused',
    },
    {
        id: 'SES-004',
        studentName: 'Sophie Chen',
        examName: 'CS101 Midterm',
        proctorName: 'Michael Smith',
        duration: '52m 18s',
        status: 'live',
    },
];

// Options for Dropdowns
export const MOCK_PROCTOR_OPTIONS = [
    { id: 'proc_1', name: 'Sarah Connor' },
    { id: 'proc_2', name: 'John Wick' },
    { id: 'proc_3', name: 'Ellen Ripley' },
];

export const MOCK_EXAM_OPTIONS = [
    { id: 'exam_1', name: 'CS101: Introduction to Programming' },
    { id: 'exam_2', name: 'MATH202: Advanced Calculus' },
    { id: 'exam_3', name: 'PHYS101: Physics I' },
];
// Institutions
export const MOCK_INSTITUTIONS: Institution[] = [
    {
        id: 'INST-001',
        name: 'National University - Manila',
        code: 'NUM',
        createdAt: new Date().toISOString(),
        createdBy: 'System Superadmin',
    },
    {
        id: 'INST-002',
        name: 'National University - Dasmariñas',
        code: 'NUD',
        createdAt: new Date().toISOString(),
        createdBy: 'System Superadmin',
    },
    {
        id: 'INST-003',
        name: 'National University - Fairview',
        code: 'NUF',
        createdAt: new Date().toISOString(),
        createdBy: 'System Superadmin',
    },
    {
        id: 'INST-004',
        name: 'St. Mary\'s College',
        code: 'SMC',
        createdAt: new Date().toISOString(),
        createdBy: 'System Superadmin',
    },
];

// Administrators
export const MOCK_ADMINISTRATORS: AdminUser[] = [
    {
        id: 'ADM-001',
        firstName: 'Robert',
        lastName: 'Smith',
        email: 'robert.smith@nu-manila.edu',
        role: 'admin',
        status: 'active',
        institution: 'National University - Manila',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'ADM-002',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@nu-dasma.edu',
        role: 'admin',
        status: 'active',
        institution: 'National University - Dasmariñas',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'ADM-003',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@nu-fairview.edu',
        role: 'admin',
        status: 'inactive',
        institution: 'National University - Fairview',
        createdAt: new Date().toISOString(),
    },
];

// Permissions & Roles
export interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[]; // Permission IDs
}

export const MOCK_PERMISSIONS: Permission[] = [
    { id: 'dashboard:view_stats', name: 'view_dashboard_stats', description: 'Access to system dashboard stats', module: 'Dashboard' },
    { id: 'user:manage', name: 'manage_users', description: 'Create and edit users', module: 'User Management' },
    { id: 'institution:manage', name: 'manage_institutions', description: 'Create and edit institutions', module: 'Institution Management' },
    { id: 'system:view_logs', name: 'view_logs', description: 'View audit logs', module: 'System' },
    { id: 'exam:manage', name: 'manage_exams', description: 'Create and manage exams', module: 'Exams' },
];

export const MOCK_ROLES: Role[] = [
    {
        id: 'role_1',
        name: 'Institution Admin',
        description: 'Full access to institution resources',
        permissions: ['dashboard:view_stats', 'user:manage', 'exam:manage'],
    },
    {
        id: 'role_2',
        name: 'Department Head',
        description: 'Manage department-level data',
        permissions: ['dashboard:view_stats', 'exam:manage'],
    },
];

// Admin Institution Assignments
export interface AdminAssignment {
    id: string;
    adminId: string;
    adminName: string;
    institutionId: string;
    institutionName: string;
    assignedAt: string;
    status: 'active' | 'inactive';
}

export const MOCK_ADMIN_ASSIGNMENTS: AdminAssignment[] = [
    {
        id: 'ASN-001',
        adminId: 'ADM-001',
        adminName: 'Robert Smith',
        institutionId: 'INST-001',
        institutionName: 'National University - Manila',
        assignedAt: new Date().toISOString(),
        status: 'active',
    },
];

// ============================================================================
// EXAMS
// ============================================================================
import { Exam, ExamQuestion } from '../types';

export const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
    {
        id: 'q-1',
        examId: 'exam-001',
        type: 'MULTIPLE_CHOICE',
        points: 5,
        orderIndex: 0,
        content: {
            prompt: "What is the primary purpose of a 'volatile' keyword in Java?",
            options: [
                'To prevent thread caching of variables',
                'To make a variable immutable',
                'To allow multiple inheritance',
                'To optimize loop performance',
            ],
            correctAnswer: 0,
        },
    },
    {
        id: 'q-2',
        examId: 'exam-001',
        type: 'TRUE_FALSE',
        points: 2,
        orderIndex: 1,
        content: {
            prompt: 'React uses a Virtual DOM to minimize actual DOM manipulations.',
            correctAnswer: true,
        },
    },
    {
        id: 'q-3',
        examId: 'exam-001',
        type: 'IDENTIFICATION',
        points: 3,
        orderIndex: 2,
        content: {
            prompt: 'What does HTML stand for?',
            acceptedAnswers: ['HyperText Markup Language', 'Hypertext Markup Language'],
        },
    },
    {
        id: 'q-4',
        examId: 'exam-002',
        type: 'IDENTIFICATION',
        points: 10,
        orderIndex: 0,
        content: {
            prompt: "Explain the concept of 'closures' in JavaScript with a practical example.",
            rubric: 'Understanding of scope, inner functions, and data encapsulation.',
            maxLength: 1000,
        },
    },
    {
        id: 'q-5',
        examId: 'exam-003',
        type: 'MATCHING',
        points: 5,
        orderIndex: 0,
        content: {
            prompt: 'Match the CSS property to its effect.',
            pairs: [
                { left: 'display: flex', right: 'Enables flexbox layout' },
                { left: 'position: absolute', right: 'Relative to nearest positioned ancestor' },
                { left: 'opacity: 0', right: 'Makes element fully transparent' },
            ],
        },
    },
];

export const MOCK_EXAMS: Exam[] = [
    {
        id: 'exam-001',
        title: 'Advanced Web Development Midterm',
        description: 'Covers React, Next.js, and modern CSS techniques.',
        duration: 60,
        passingScore: 75,
        status: 'published',
        subject: 'Web Development',
        subjectId: 'sub-001',
        studentsCount: 45,
        questionCount: 30,
        scheduledDate: '2026-03-25T10:00:00Z',
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        },
        questions: MOCK_EXAM_QUESTIONS.slice(0, 3),
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-15T14:30:00Z',
        share: {
            visibility: 'public',
            link: 'https://sentinel.edu/exam/wd-midterm',
            embedCode: "<iframe src='...'></iframe>",
        },
        assignment: {
            studentIds: ['s1', 's2'],
            groupIds: ['g1'],
            dueDate: '2026-03-25',
            dueTime: '23:59',
            instructions: 'No external resources allowed.',
            notify: true,
        },
    },
    {
        id: 'exam-002',
        title: 'Database Systems Quiz 1',
        description: 'Focuses on SQL basics and normalization.',
        duration: 30,
        passingScore: 80,
        status: 'draft',
        subject: 'Databases',
        subjectId: 'sub-002',
        studentsCount: 30,
        questionCount: 15,
        settings: {
            shuffleQuestions: false,
            showCorrectAnswers: true,
            allowReview: true,
            randomizeChoices: false,
        },
        questions: [],
        createdAt: '2026-03-10T09:00:00Z',
        updatedAt: '2026-03-10T09:00:00Z',
        share: {
            visibility: 'private',
            link: '',
            embedCode: '',
        },
        assignment: {
            studentIds: [],
            groupIds: [],
            dueDate: '',
            dueTime: '',
            instructions: '',
            notify: false,
        },
    },
    {
        id: 'exam-003',
        title: 'Legacy Intro to Java',
        description: 'Introduction to Java programming language concepts.',
        duration: 120,
        passingScore: 70,
        status: 'archived',
        subject: 'Computer Science',
        subjectId: 'sub-003',
        studentsCount: 50,
        questionCount: 40,
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: true,
            allowReview: false,
            randomizeChoices: true,
        },
        questions: MOCK_EXAM_QUESTIONS,
        createdAt: '2025-09-15T08:00:00Z',
        updatedAt: '2025-10-30T10:00:00Z',
        share: {
            visibility: 'private',
            link: '',
            embedCode: '',
        },
        assignment: {
            studentIds: [],
            groupIds: [],
            dueDate: '',
            dueTime: '',
            instructions: '',
            notify: false,
        },
    },
];
