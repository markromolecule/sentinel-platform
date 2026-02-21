import {
    AdminUser,
    UserRole,
    SystemStat,
    Activity,
    ExamConfig,
    ProctorAssignment,
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
    ProctorAssignment,
    AnalyticsReport,
    AuditLog,
    Announcement,
    UserRole,
};

// Admin User Roles
export type AdminUserRole = UserRole;
