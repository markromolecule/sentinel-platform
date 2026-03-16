export const PERMISSION_CATEGORIES = {
    DASHBOARD: 'Dashboard & Analytics',
    INSTITUTION: 'Institution Management',
    USER: 'User & Access Management',
    ACADEMIC: 'Academic Management',
    EXAM: 'Exam Management',
    PROCTORING: 'Proctoring & Monitoring',
    COMMUNICATION: 'Communication',
    SYSTEM: 'System & Support',
} as const;

export type PermissionCategory = keyof typeof PERMISSION_CATEGORIES;

export interface Permission {
    id: string;
    name: string;
    description: string;
    category: PermissionCategory;
}

export const PERMISSIONS: Record<string, Permission> = {
    // Dashboard
    VIEW_DASHBOARD_STATS: { 
        id: 'dashboard:view_stats', 
        name: 'View Dashboard Stats', 
        description: 'Allows viewing of high-level system statistics on the dashboard.',
        category: 'DASHBOARD' 
    },
    VIEW_ANALYTICS: { 
        id: 'dashboard:view_analytics', 
        name: 'View Analytics', 
        description: 'Access to detailed analytics charts and performance trends.',
        category: 'DASHBOARD' 
    },
    EXPORT_REPORTS: { 
        id: 'dashboard:export_reports', 
        name: 'Export Reports', 
        description: 'Ability to export data reports in various formats (PDF, CSV).',
        category: 'DASHBOARD' 
    },

    // Institution
    VIEW_INSTITUTIONS: { 
        id: 'institution:view', 
        name: 'View Institutions', 
        description: 'Allows viewing the list of academic institutions.',
        category: 'INSTITUTION' 
    },
    MANAGE_INSTITUTIONS: { 
        id: 'institution:manage', 
        name: 'Manage Institutions', 
        description: 'Create, edit, and delete institution records.',
        category: 'INSTITUTION' 
    },

    // Users
    VIEW_USERS: { 
        id: 'user:view', 
        name: 'View Users', 
        description: 'Allows viewing of user profiles and lists.',
        category: 'USER' 
    },
    MANAGE_USERS: { 
        id: 'user:manage', 
        name: 'Manage Users', 
        description: 'Create, update, and manage account statuses of users.',
        category: 'USER' 
    },
    MANAGE_PERMISSIONS: { 
        id: 'user:manage_permissions', 
        name: 'Manage Permissions', 
        description: 'Assign or revoke permissions and roles for users.',
        category: 'USER' 
    },

    // Academic
    MANAGE_DEPARTMENTS: { 
        id: 'academic:manage_departments', 
        name: 'Manage Departments', 
        description: 'Create and organize academic departments.',
        category: 'ACADEMIC' 
    },
    MANAGE_COURSES: { 
        id: 'academic:manage_courses', 
        name: 'Manage Courses', 
        description: 'Create and manage academic course offerings.',
        category: 'ACADEMIC' 
    },
    MANAGE_SECTIONS: { 
        id: 'academic:manage_sections', 
        name: 'Manage Sections', 
        description: 'Manage class sections and student groups.',
        category: 'ACADEMIC' 
    },
    MANAGE_SUBJECTS: { 
        id: 'academic:manage_subjects', 
        name: 'Manage Subjects', 
        description: 'Catalog and manage institutional subjects.',
        category: 'ACADEMIC' 
    },

    // Exams
    VIEW_EXAMS: { 
        id: 'exam:view', 
        name: 'View Exams', 
        description: 'Access to view exam schedules and details.',
        category: 'EXAM' 
    },
    MANAGE_EXAMS: { 
        id: 'exam:manage', 
        name: 'Manage Exams', 
        description: 'Create, schedule, and configure exams.',
        category: 'EXAM' 
    },
    PUBLISH_EXAMS: { 
        id: 'exam:publish', 
        name: 'Publish Exams', 
        description: 'Release exams to students.',
        category: 'EXAM' 
    },

    // Proctoring
    PROCTOR_EXAM: { 
        id: 'proctoring:proctor_exam', 
        name: 'Proctor Exam', 
        description: 'Ability to proctor live exam sessions.',
        category: 'PROCTORING' 
    },
    MONITOR_REALTIME: { 
        id: 'proctoring:monitor_realtime', 
        name: 'Real-time Monitoring', 
        description: 'Access to real-time proctoring monitoring dashboard.',
        category: 'PROCTORING' 
    },
    GRADE_EXAM: { 
        id: 'proctoring:grade_exam', 
        name: 'Grade Exam', 
        description: 'Review and grade student exam submissions.',
        category: 'PROCTORING' 
    },

    // Communication
    MANAGE_ANNOUNCEMENTS: { 
        id: 'comm:manage_announcements', 
        name: 'Manage Announcements', 
        description: 'Post and manage system-wide or institutional announcements.',
        category: 'COMMUNICATION' 
    },
    SEND_MESSAGES: { 
        id: 'comm:send_messages', 
        name: 'Send Messages', 
        description: 'Access to real-time chat and internal messaging.',
        category: 'COMMUNICATION' 
    },

    // System
    VIEW_LOGS: { 
        id: 'system:view_logs', 
        name: 'View Audit Logs', 
        description: 'View system audit trails and security logs.',
        category: 'SYSTEM' 
    },
    VIEW_GUIDES: { 
        id: 'system:view_guides', 
        name: 'View Guides', 
        description: 'Access to administrator and proctor help guides.',
        category: 'SYSTEM' 
    },
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
