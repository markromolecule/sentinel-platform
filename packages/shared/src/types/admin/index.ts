import {
    AdminUser,
    UserRole,
    SystemStat,
    Activity,
    ExamConfig,
    InstructorAssignment,
    AnalyticsReport,
    AuditLog,
    Announcement,
} from '../';

// Re-export shared types
export type {
    AdminUser,
    SystemStat,
    Activity,
    ExamConfig,
    InstructorAssignment,
    AnalyticsReport,
    AuditLog,
    Announcement,
    UserRole,
};

// Admin User Roles
export type AdminUserRole = UserRole;
