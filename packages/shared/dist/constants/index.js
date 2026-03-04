"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_GRADING_EXAMS = exports.statusConfig = exports.severityColors = exports.flagLabels = exports.flagIcons = exports.MOCK_PROCTOR_STUDENTS = exports.MOCK_MONITORING_STUDENTS = exports.MOCK_EXAM = exports.SOCIAL_LINKS = exports.FOOTER_LINKS = exports.NAV_ITEMS = exports.MOCK_MASTER_SUBJECTS = exports.MOCK_SUBJECTS = exports.DEFAULT_SUBJECT_STORE_STATE = exports.DEFAULT_SECTION_STORE_STATE = exports.MOCK_SECTIONS_LOCAL = exports.MOCK_MESSAGES = exports.MOCK_CONVERSATIONS = exports.MOCK_INCIDENT_TRENDS = exports.MOCK_EXAM_COMPLETION_DATA = exports.MOCK_ANNOUNCEMENTS = exports.MOCK_AUDIT_LOGS = exports.MOCK_REPORTS = exports.MOCK_PROCTOR_ASSIGNMENTS = exports.MOCK_EXAM_CONFIG = exports.MOCK_RECENT_ACTIVITY = exports.MOCK_SYSTEM_STATS = exports.ConstantsAdmin_MOCK_ADMIN_USERS = exports.COURSE_QUERY_KEYS = exports.DEPARTMENT_QUERY_KEYS = exports.INCIDENT_LABELS = exports.ConstantsAdminDashboard_INCIDENT_LABELS = exports.MOCK_FLAGGED_INCIDENTS = exports.MOCK_ADMIN_EVENTS = exports.SEMESTERS = exports.YEAR_LEVELS = exports.DEPARTMENTS_ABBR = exports.DEPARTMENTS = exports.SUPPORT_EMAIL = exports.APP_NAME = exports.ACTION_TYPES = exports.EXAM_DIFFICULTIES = exports.EXAM_STATUSES = exports.USER_ROLES = exports.PASSWORD_REGEX = exports.EMAIL_REGEX = exports.DATETIME_FORMAT = exports.TIME_FORMAT = exports.DATE_FORMAT = exports.DEFAULT_PAGINATION_LIMIT = void 0;
exports.MOCK_NOTIFICATIONS = exports.STUDENT_NAVIGATION = exports.MOCK_EXAM_HISTORY = exports.MOCK_EXAMS = exports.MOCK_STUDENT = exports.LOW_TIME_THRESHOLD_SECONDS = exports.MOCK_QUESTIONS = exports.MOBILE_USER_AGENT_REGEX = exports.HEADER_NAV_ITEMS = exports.BOTTOM_NAV_ITEMS = exports.MOCK_ACTIVE_SESSIONS = exports.MOCK_SECTIONS = exports.MOCK_AVAILABLE_SUBJECTS = exports.MOCK_DASHBOARD_STATS = exports.PROCTOR_NAV_ITEMS = exports.MOCK_PROCTOR_EXAMS = exports.MOCK_PROCTOR = exports.MOCK_GRADING_STUDENTS = void 0;
// Configuration Constants
exports.DEFAULT_PAGINATION_LIMIT = 10;
exports.DATE_FORMAT = 'MMM dd, yyyy';
exports.TIME_FORMAT = 'hh:mm a';
exports.DATETIME_FORMAT = 'MMM dd, yyyy hh:mm a';
// Validation Regex
exports.EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Enum Collections (for iteration/validation)
exports.USER_ROLES = ['admin', 'proctor', 'student', 'instructor'];
exports.EXAM_STATUSES = [
    'available',
    'completed',
    'in-progress',
    'upcoming',
    'draft',
    'scheduled',
    'active',
];
exports.EXAM_DIFFICULTIES = ['easy', 'medium', 'hard'];
exports.ACTION_TYPES = ['info', 'warning', 'error', 'success'];
// App Constants
exports.APP_NAME = 'Sentinel Proctoring System';
exports.SUPPORT_EMAIL = 'support@sentinel.com';
// Academic Constants
exports.DEPARTMENTS = [
    'School of Engineering, Computing, and Architecture', // SECA
    'School of Business, Management, and Accountancy', // SBMA
    'School of Arts, Sciences, and Education', // SASE
];
exports.DEPARTMENTS_ABBR = {
    'School of Engineering, Computing, and Architecture': 'SECA',
    'School of Business, Management, and Accountancy': 'SBMA',
    'School of Arts, Sciences, and Education': 'SASE',
};
exports.YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
exports.SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];
// Backported specific exports
var calendar_1 = require("./admin/calendar");
Object.defineProperty(exports, "MOCK_ADMIN_EVENTS", { enumerable: true, get: function () { return calendar_1.MOCK_ADMIN_EVENTS; } });
var dashboard_1 = require("./admin/dashboard");
Object.defineProperty(exports, "MOCK_FLAGGED_INCIDENTS", { enumerable: true, get: function () { return dashboard_1.MOCK_FLAGGED_INCIDENTS; } });
var dashboard_2 = require("./admin/dashboard");
Object.defineProperty(exports, "ConstantsAdminDashboard_INCIDENT_LABELS", { enumerable: true, get: function () { return dashboard_2.incidentLabels; } });
var proctor_1 = require("./proctor");
Object.defineProperty(exports, "INCIDENT_LABELS", { enumerable: true, get: function () { return proctor_1.INCIDENT_LABELS; } });
var departments_1 = require("./admin/departments");
Object.defineProperty(exports, "DEPARTMENT_QUERY_KEYS", { enumerable: true, get: function () { return departments_1.DEPARTMENT_QUERY_KEYS; } });
var courses_1 = require("./admin/courses");
Object.defineProperty(exports, "COURSE_QUERY_KEYS", { enumerable: true, get: function () { return courses_1.COURSE_QUERY_KEYS; } });
var admin_1 = require("./admin");
Object.defineProperty(exports, "ConstantsAdmin_MOCK_ADMIN_USERS", { enumerable: true, get: function () { return admin_1.MOCK_USERS; } });
var admin_2 = require("./admin");
Object.defineProperty(exports, "MOCK_SYSTEM_STATS", { enumerable: true, get: function () { return admin_2.MOCK_SYSTEM_STATS; } });
var admin_3 = require("./admin");
Object.defineProperty(exports, "MOCK_RECENT_ACTIVITY", { enumerable: true, get: function () { return admin_3.MOCK_RECENT_ACTIVITY; } });
var admin_4 = require("./admin");
Object.defineProperty(exports, "MOCK_EXAM_CONFIG", { enumerable: true, get: function () { return admin_4.MOCK_EXAM_CONFIG; } });
var admin_5 = require("./admin");
Object.defineProperty(exports, "MOCK_PROCTOR_ASSIGNMENTS", { enumerable: true, get: function () { return admin_5.MOCK_PROCTOR_ASSIGNMENTS; } });
var admin_6 = require("./admin");
Object.defineProperty(exports, "MOCK_REPORTS", { enumerable: true, get: function () { return admin_6.MOCK_REPORTS; } });
var admin_7 = require("./admin");
Object.defineProperty(exports, "MOCK_AUDIT_LOGS", { enumerable: true, get: function () { return admin_7.MOCK_AUDIT_LOGS; } });
var admin_8 = require("./admin");
Object.defineProperty(exports, "MOCK_ANNOUNCEMENTS", { enumerable: true, get: function () { return admin_8.MOCK_ANNOUNCEMENTS; } });
var admin_9 = require("./admin");
Object.defineProperty(exports, "MOCK_EXAM_COMPLETION_DATA", { enumerable: true, get: function () { return admin_9.MOCK_EXAM_COMPLETION_DATA; } });
var admin_10 = require("./admin");
Object.defineProperty(exports, "MOCK_INCIDENT_TRENDS", { enumerable: true, get: function () { return admin_10.MOCK_INCIDENT_TRENDS; } });
var messages_1 = require("./admin/messages");
Object.defineProperty(exports, "MOCK_CONVERSATIONS", { enumerable: true, get: function () { return messages_1.MOCK_CONVERSATIONS; } });
var messages_2 = require("./admin/messages");
Object.defineProperty(exports, "MOCK_MESSAGES", { enumerable: true, get: function () { return messages_2.MOCK_MESSAGES; } });
var sections_1 = require("./admin/sections");
Object.defineProperty(exports, "MOCK_SECTIONS_LOCAL", { enumerable: true, get: function () { return sections_1.MOCK_SECTIONS_LOCAL; } });
var sections_2 = require("./admin/sections");
Object.defineProperty(exports, "DEFAULT_SECTION_STORE_STATE", { enumerable: true, get: function () { return sections_2.DEFAULT_SECTION_STORE_STATE; } });
var subjects_1 = require("./admin/subjects");
Object.defineProperty(exports, "DEFAULT_SUBJECT_STORE_STATE", { enumerable: true, get: function () { return subjects_1.DEFAULT_SUBJECT_STORE_STATE; } });
var subjects_2 = require("./admin/subjects");
Object.defineProperty(exports, "MOCK_SUBJECTS", { enumerable: true, get: function () { return subjects_2.MOCK_SUBJECTS; } });
var subjects_3 = require("./admin/subjects");
Object.defineProperty(exports, "MOCK_MASTER_SUBJECTS", { enumerable: true, get: function () { return subjects_3.MOCK_MASTER_SUBJECTS; } });
var common_1 = require("./common");
Object.defineProperty(exports, "NAV_ITEMS", { enumerable: true, get: function () { return common_1.NAV_ITEMS; } });
var common_2 = require("./common");
Object.defineProperty(exports, "FOOTER_LINKS", { enumerable: true, get: function () { return common_2.FOOTER_LINKS; } });
var common_3 = require("./common");
Object.defineProperty(exports, "SOCIAL_LINKS", { enumerable: true, get: function () { return common_3.SOCIAL_LINKS; } });
var monitoring_1 = require("./proctor/exams/[id]/monitoring");
Object.defineProperty(exports, "MOCK_EXAM", { enumerable: true, get: function () { return monitoring_1.MOCK_EXAM; } });
var monitoring_2 = require("./proctor/exams/[id]/monitoring");
Object.defineProperty(exports, "MOCK_MONITORING_STUDENTS", { enumerable: true, get: function () { return monitoring_2.MOCK_STUDENTS; } });
var proctor_2 = require("./proctor");
Object.defineProperty(exports, "MOCK_PROCTOR_STUDENTS", { enumerable: true, get: function () { return proctor_2.MOCK_STUDENTS; } });
var monitoring_3 = require("./proctor/exams/[id]/monitoring");
Object.defineProperty(exports, "flagIcons", { enumerable: true, get: function () { return monitoring_3.flagIcons; } });
var monitoring_4 = require("./proctor/exams/[id]/monitoring");
Object.defineProperty(exports, "flagLabels", { enumerable: true, get: function () { return monitoring_4.flagLabels; } });
var monitoring_5 = require("./proctor/exams/[id]/monitoring");
Object.defineProperty(exports, "severityColors", { enumerable: true, get: function () { return monitoring_5.severityColors; } });
var monitoring_6 = require("./proctor/exams/[id]/monitoring");
Object.defineProperty(exports, "statusConfig", { enumerable: true, get: function () { return monitoring_6.statusConfig; } });
var grading_1 = require("./proctor/grading");
Object.defineProperty(exports, "MOCK_GRADING_EXAMS", { enumerable: true, get: function () { return grading_1.MOCK_GRADING_EXAMS; } });
var grading_2 = require("./proctor/grading");
Object.defineProperty(exports, "MOCK_GRADING_STUDENTS", { enumerable: true, get: function () { return grading_2.MOCK_GRADING_STUDENTS; } });
var proctor_3 = require("./proctor");
Object.defineProperty(exports, "MOCK_PROCTOR", { enumerable: true, get: function () { return proctor_3.MOCK_PROCTOR; } });
var proctor_4 = require("./proctor");
Object.defineProperty(exports, "MOCK_PROCTOR_EXAMS", { enumerable: true, get: function () { return proctor_4.MOCK_PROCTOR_EXAMS; } });
var proctor_5 = require("./proctor");
Object.defineProperty(exports, "PROCTOR_NAV_ITEMS", { enumerable: true, get: function () { return proctor_5.PROCTOR_NAV_ITEMS; } });
var proctor_6 = require("./proctor");
Object.defineProperty(exports, "MOCK_DASHBOARD_STATS", { enumerable: true, get: function () { return proctor_6.MOCK_DASHBOARD_STATS; } });
var proctor_7 = require("./proctor");
Object.defineProperty(exports, "MOCK_AVAILABLE_SUBJECTS", { enumerable: true, get: function () { return proctor_7.MOCK_AVAILABLE_SUBJECTS; } });
var proctor_8 = require("./proctor");
Object.defineProperty(exports, "MOCK_SECTIONS", { enumerable: true, get: function () { return proctor_8.MOCK_SECTIONS; } });
var proctor_9 = require("./proctor");
Object.defineProperty(exports, "MOCK_ACTIVE_SESSIONS", { enumerable: true, get: function () { return proctor_9.MOCK_ACTIVE_SESSIONS; } });
var student_1 = require("./protected/student");
Object.defineProperty(exports, "BOTTOM_NAV_ITEMS", { enumerable: true, get: function () { return student_1.BOTTOM_NAV_ITEMS; } });
var student_2 = require("./protected/student");
Object.defineProperty(exports, "HEADER_NAV_ITEMS", { enumerable: true, get: function () { return student_2.HEADER_NAV_ITEMS; } });
var configuration_1 = require("./student/exam/[id]/configuration");
Object.defineProperty(exports, "MOBILE_USER_AGENT_REGEX", { enumerable: true, get: function () { return configuration_1.MOBILE_USER_AGENT_REGEX; } });
var monitoring_7 = require("./student/exam/[id]/monitoring");
Object.defineProperty(exports, "MOCK_QUESTIONS", { enumerable: true, get: function () { return monitoring_7.MOCK_QUESTIONS; } });
var monitoring_8 = require("./student/exam/[id]/monitoring");
Object.defineProperty(exports, "LOW_TIME_THRESHOLD_SECONDS", { enumerable: true, get: function () { return monitoring_8.LOW_TIME_THRESHOLD_SECONDS; } });
var student_3 = require("./student");
Object.defineProperty(exports, "MOCK_STUDENT", { enumerable: true, get: function () { return student_3.MOCK_STUDENT; } });
var student_4 = require("./student");
Object.defineProperty(exports, "MOCK_EXAMS", { enumerable: true, get: function () { return student_4.MOCK_EXAMS; } });
var student_5 = require("./student");
Object.defineProperty(exports, "MOCK_EXAM_HISTORY", { enumerable: true, get: function () { return student_5.MOCK_EXAM_HISTORY; } });
var student_6 = require("./student");
Object.defineProperty(exports, "STUDENT_NAVIGATION", { enumerable: true, get: function () { return student_6.STUDENT_NAVIGATION; } });
var notifications_1 = require("./student/notifications");
Object.defineProperty(exports, "MOCK_NOTIFICATIONS", { enumerable: true, get: function () { return notifications_1.MOCK_NOTIFICATIONS; } });
// Proctor Exams
__exportStar(require("./proctor/exams/exam-constants"), exports);
//# sourceMappingURL=index.js.map