// Student
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Enums
export type UserRole =
    | 'admin'
    | 'proctor'
    | 'student'
    | 'instructor'
    | 'superadmin'
    | 'disciplinary_officer'
    | 'support';
export type UserStatus = 'active' | 'inactive' | 'offline' | 'suspended' | 'archived';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type ActionType = 'info' | 'warning' | 'error' | 'success';
export type ExamDifficulty = 'easy' | 'medium' | 'hard';
export type CheatingType =
    | 'gaze'
    | 'audio'
    | 'tab_switch'
    | 'screenshot'
    | 'screen_record'
    | 'multiple';
export * from './exams/exam';

export interface PresenceState {
    user_id: string;
    email: string;
    online_at: string;
}

// Core Entities

export interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    name?: string; // Virtual or concatenated name
    avatarUrl?: string | null;
    status: UserStatus;
    department?: string;
    departmentCode?: string | null;
    departmentId?: string | null;
    course?: string;
    courses?: string[];
    courseId?: string | null;
    courseIds?: string[];
    studentNo?: string | null;
    institution?: string;
    institutionId?: string | null;
    employeeNo?: string | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}

export interface AdminUser extends User {
    role: 'admin';
    studentNo?: string; // For students
}

// Student & Academic
export interface Student extends User {
    role: 'student';
    userId: string;
    firstName: string;
    lastName: string;
    studentNo: string;
    section: string;
    term: string;
    subject: string;
    departmentId?: string | null;
    institutionId?: string | null;
    createdBy?: Date | string | null;
    createdAt: Date | string | null;
}

export interface Instructor extends User {
    role: 'instructor';
    userId: string;
    firstName: string;
    lastName: string;
    employeeNo: string;
    departmentId?: string | null;
    institutionId?: string | null;
    createdBy?: Date | string | null;
    createdAt?: Date | string | null;
}

export interface Department {
    id: string;
    name: string;
    code?: string | null;
    institution?: string | null;
    institutionId?: string | null;
    createdAt?: Date | string | null;
    createdBy?: Date | string | null;
    updatedAt?: Date | string | null;
    updatedBy?: Date | string | null;
}

export interface Institution {
    id: string;
    name: string;
    code?: string | null;
    createdAt: Date | string;
    createdBy: string;
    updatedAt?: Date | string | null;
    updatedBy?: string | null;
}

export interface InstitutionInput {
    name: string;
    code?: string | null;
}

export interface OnboardingFormValues {
    firstName: string;
    lastName: string;
    studentNumber: string;
    institutionId: string;
    departmentId: string;
    courseId: string;
}

export interface Subject {
    id: string;
    subjectOfferingId?: string;
    title: string;
    code: string;
    section?: string; // Deprecated
    sections?: string[] | { id: string; name: string }[];
    department?: string;
    department_code?: string | null;
    departments?: string[];
    course?: string;
    course_code?: string | null;
    courses?: string[];
    yearLevel?: string;
    yearLevels?: string[];
    departmentIds?: string[];
    courseIds?: string[];
    sectionIds?: string[];
    yearLevelsNumeric?: number[];
    createdAt: string | null;
    createdBy: string | null; // Name of instructor/creator
    updatedAt?: string | null;
    updatedBy?: string | null;
    instructorId?: string; // ID of the assigned instructor
    status?: string; // Enrollment status (e.g., PENDING, APPROVED, REJECTED)
    requested_at?: string | null;
    approved_at?: string | null;
    approved_by?: string | null;
    termId?: string | null;
    termAcademicYear?: string | null;
    termSemester?: string | null;
}

export * from './enrollment';

// Exam Configuration

export interface ExamHistory {
    id: string;
    examId: string;
    examTitle: string;
    subject: string;
    dateTaken: string;
    score: number;
    totalScore: number;
    percentage: number;
    status: 'passed' | 'failed';
    timeSpent: number; // in minutes
    cheated?: boolean;
    cheatingType?: CheatingType;
}

export interface ExamConfig {
    id: string;
    name: string;
    allowedDevices: string[];
    cameraRequired: boolean;
    micRequired: boolean;
    aiRules: {
        web: {
            gazeTracking: boolean;
            audioDetection: boolean;
            tabSwitching: boolean;
            copyPaste: boolean;
            printScreenDisable: boolean;
        };
        mobile: {
            gazeTracking: boolean;
            audioDetection: boolean;
            appPinning: boolean;
            screenshotDisable: boolean;
        };
    };
    maxReconnectAttempts: number;
    autoSubmitTimeout: number; // in minutes
}

// Assignments
export interface InstructorAssignment {
    id: string;
    instructorId: string;
    instructorName: string;
    examId: string;
    examName: string;
    assignedStudents: number;
    notes: string;
    status: 'active' | 'completed' | 'scheduled';
}

export type ProctorInfo = {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    department: string;
    institution: string;
};

// Exam forms
export * as AdminExamConfigTypes from './admin/exams/configuration';
export * as ProctorExamConfigTypes from './proctor/exams/configuration';

// Analytics & Reports
export interface AnalyticsReport {
    id: string;
    title: string;
    type: 'completion' | 'incident' | 'performance';
    generatedAt: string;
    format: 'pdf' | 'csv' | 'xlsx';
    status: 'ready' | 'generating' | 'failed';
}

export interface SystemStat {
    label: string;
    value: string | number;
    change?: number; // percentage change
    trend?: TrendDirection;
    description?: string;
}

// System Logs
export interface AuditLog {
    id: string;
    actor: string; // User ID or Name
    action: string;
    resourceType: string;
    resourceId: string;
    details: string;
    timestamp: string;
}

export interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    type: ActionType;
}

// Announcements
export interface Announcement {
    id: string;
    title: string;
    content: string;
    targetAudience: ('all' | 'students' | 'proctors')[];
    status: 'published' | 'draft' | 'scheduled';
    publishedAt?: string;
    author: string;
}

// Dashboard & Incidents
export type FlaggedIncident = {
    id: string;
    studentName: string;
    examName: string;
    incidentType:
        | 'face_not_visible'
        | 'multiple_faces'
        | 'tab_switch'
        | 'audio_detected'
        | 'suspicious_movement';
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    status: 'pending' | 'reviewed' | 'resolved';
};

// Calendar
export type TargetAudience = 'all' | 'students' | 'proctors' | 'specific_group';

export interface AdminEvent {
    id: string;
    date: Date;
    title: string;
    description: string;
    type: 'event' | 'announcement' | 'maintenance';
    targetAudience: TargetAudience;
    startTime?: string;
    endTime?: string;
    createdBy: string;
}

export interface CalendarDay {
    date: Date;
    events: AdminEvent[];
    isCurrentMonth: boolean;
    isToday: boolean;
}

// Chat & Messages
export type ChatUserStatus = 'online' | 'offline' | 'busy';

export interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    status: ChatUserStatus;
    role: 'admin' | 'proctor' | 'student' | 'instructor';
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    participants: ChatUser[];
    lastMessage?: Message;
    unreadCount?: number;
}
export interface Term {
    id: string;
    academicYear: string; // e.g. "2023-2024"
    semester: string;
    isActive: boolean;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    institution?: string | null;
    institutionId?: string | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}

export type Semester = Term;

export interface SemesterInput {
    academic_year: string;
    semester: string;
    is_active: boolean;
    start_date?: string | Date | null | undefined;
    end_date?: string | Date | null | undefined;
    institution_id?: string | null;
}

export interface Section {
    id: string; // Maps to section_id
    name: string; // Maps to section_name
    departmentId: string | null; // Maps to department_id
    courseId: string | null; // Maps to course_id
    yearLevel?: number; // Maps to year_level (optional in DB, can be smallint)
    createdAt?: Date | string | null;
    createdBy?: string;
    updatedAt?: Date | string | null;
    updatedBy?: string;
}

export interface ClassGroup {
    id: string;
    subjectId: string;
    sectionId: string;
    termId: string;
    schedule?: string; // e.g. "MWF 10:00-11:30"
    room?: string;
    instructorId?: string;
    createdAt?: string;
}

export interface Course {
    id: string;
    code: string; // e.g., "BSIT-MWA"
    title: string; // e.g., "Bachelor of Science in Information Technology - Mobile Web Applications"
    department?: string;
    departmentId?: string | null;
    institutionId?: string | null;
    description?: string;
    createdAt: string | null;
    createdBy?: string;
    updatedAt?: string | null;
    updatedBy?: string;
}

export interface CourseInput {
    code: string | null;
    title: string;
    departmentId: string | null;
    description: string | null;
}

export interface MasterSubject {
    id?: string;
    code: string;
    title: string;
    termId?: string | null;
    isOpened?: boolean;
    offeringStartDate?: Date | string | null;
    offeringEndDate?: Date | string | null;
    department?: string;
    yearLevel?: string;
    sections?: string[];
    departmentIds?: string[];
    courseIds?: string[];
    sectionIds?: string[];
    yearLevels?: number[];
    createdAt?: Date | string | null;
    createdBy?: string | null;
    updatedAt?: Date | string | null;
    updatedBy?: string | null;
}

export type SubjectOfferingStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface SubjectOffering {
    id: string;
    subjectId: string;
    subjectCode: string;
    subjectTitle: string;
    termId: string;
    termAcademicYear: string;
    termSemester: string;
    termStartDate?: Date | string | null;
    termEndDate?: Date | string | null;
    status: SubjectOfferingStatus;
    departmentIds: string[];
    courseIds: string[];
    sectionIds: string[];
    yearLevels: number[];
    createdAt?: Date | string | null;
    createdBy?: string | null;
    updatedAt?: Date | string | null;
    updatedBy?: string | null;
}

export interface ActiveSession {
    id: string;
    studentName: string;
    examName: string;
    proctorName: string;
    duration: string;
    status: 'live' | 'paused' | 'reviewing';
}

// Auth
export type { LoginFormData } from './auth';
export type { LoginFormErrors } from './auth';
export type { RegisterFormData } from './auth';
export type { RegisterFormErrors } from './auth';

// Admin
export type { ChartProps } from './admin/analytics';
export type { AnalyticsReportsListProps } from './admin/analytics';
export type { DepartmentStoreState } from './admin/departments';
export type { DepartmentInput } from './admin/departments';
export type { FormValues } from './admin/exams/configuration';
export type { UseExamConfigFormProps } from './admin/exams/configuration';
export type { AdminUserRole } from './admin';
export type { AssignInstructorFormData } from './admin/proctor/assignment';
export type { AssignInstructorDialogProps } from './admin/proctor/assignment';
export type { SectionStatus } from './admin/sections';
export type { SectionStoreState } from './admin/sections';
export type { Section as AdminSection } from './admin/sections';
export type { SubjectStoreState } from './admin/subjects';
export type { UserManagementTableProps } from './admin/users';

// Proctoring
export type { InstructorAssignmentExam } from './proctor/assignment';
export type { DashboardStat } from './proctor/dashboard';
export type { DashboardStatsProps } from './proctor/dashboard';
export type { RecentExamsProps } from './proctor/dashboard';
export type { RecentStudentsProps } from './proctor/dashboard';
export type { FlagType } from './proctor/exams/[id]/monitoring';
export type { Flag } from './proctor/exams/[id]/monitoring';
export type { StudentSession } from './proctor/exams/[id]/monitoring';
export type { ExamData } from './proctor/exams/[id]/monitoring';
export type { MonitoringHeaderProps } from './proctor/exams/[id]/monitoring';
export type { MonitoringStatsProps } from './proctor/exams/[id]/monitoring';
export type { StudentListProps } from './proctor/exams/[id]/monitoring';
export type { StudentCardProps } from './proctor/exams/[id]/monitoring';
export type { ExamsPageHeaderProps } from './proctor/exams';
export type { ExamsFilterBarProps } from './proctor/exams';
export type { ExamsGridProps } from './proctor/exams';
export type { ExamCardProps } from './proctor/exams';
export type { ExamEmptyStateProps } from './proctor/exams';
export type { ExamCreateDialogProps } from './proctor/exams';
export type { ExamCreateFormProps } from './proctor/exams';
export type { ExamAssignDialogProps } from './proctor/exams';
export type { ExamActionCellProps } from './proctor/exams';
export type { QuestionCardProps } from './proctor/exams';
export type { QuestionFormProps } from './proctor/exams';
export type { GradingStatus } from './proctor/grading';
export type { GradingExam } from './proctor/grading';
export type { SubmissionStatus } from './proctor/grading';
export type { GradingStudent } from './proctor/grading';
export type { ProctorExam } from './proctor';
export type { EnrollmentFileColumn } from './proctor';
export type { EnrollmentFileResult } from './proctor';
export type { NavigationItem } from './proctor';
export type { ParsedStudent } from './proctor/students';
export type { ParseResult } from './proctor/students';
export type { StudentsPageHeaderProps } from './proctor/students';
export type { StudentsSearchProps } from './proctor/students';
export type { StudentsTableProps } from './proctor/students';
export type { StudentsEmptyStateProps } from './proctor/students';

// Student
export type { ExamCardProps as StudentExamCardProps } from './student';
export type { SystemCheckStatus } from './student/exam/[id]/configuration';
export type { SystemCheckItemProps } from './student/exam/[id]/configuration';
export type { UseSystemCheckReturn } from './student/exam/[id]/configuration';
export type { Question } from './student/exam/[id]/monitoring';
export type { ExamMonitoringState } from './student/exam/[id]/monitoring';
export type { ExamTimerState } from './student/exam/[id]/monitoring';
export type { ExamMonitoringData } from './student/exam/[id]/monitoring';
export type { ExamHeaderProps as MonitoringExamHeaderProps } from './student/exam/[id]/monitoring';
export type { ExamHeaderProps as HistoryExamHeaderProps } from './student/history/details';
export type { IntegrityAlertProps } from './student/exam/[id]/monitoring';
export type { QuestionDisplayProps } from './student/exam/[id]/monitoring';
export type { QuestionNavigatorProps } from './student/exam/[id]/monitoring';
export type { NavigationFooterProps } from './student/exam/[id]/monitoring';
export type { MobileNavigationProps } from './student/exam/[id]/monitoring';
export type { ExamInfoProps } from './student/history/details';
export type { ExamDetailStatsProps } from './student/history/details';
export type { ExamHeroScoreProps } from './student/history/details';
export type { HistoryFilterStatus } from './student/history';
export type { HistoryHeaderProps } from './student/history';
export type { HistoryFiltersProps } from './student/history';
export type { HistoryListProps } from './student/history';
export type { HistoryCardProps } from './student/history';
export type { UseStudentHistoryReturn } from './student/history';
export type { StudentInfo } from './student';
export type { DashboardStats } from './student';
export type { ExamListProps } from './student';
export type { ExamPaginationProps } from './student';
export type { ExamSearchProps } from './student';
export type { ExamTabsProps } from './student';
export type { ExamSidebarProps } from './student';
export type { ExamNotFoundProps } from './student';
export type { ExamInfoBarProps } from './student';
export type { ExamDescriptionProps } from './student';
export type { ExamBannerProps } from './student';
export type { NotificationType } from './student/notifications';
export type { NotificationPriority } from './student/notifications';
export type { Notification } from './student/notifications';
