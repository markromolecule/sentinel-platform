
export * from "../constants";

// Student
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Enums
export type UserRole = "admin" | "proctor" | "student" | "instructor";
export type UserStatus = "active" | "inactive" | "suspended" | "archived";
export type TrendDirection = "up" | "down" | "neutral";
export type ActionType = "info" | "warning" | "error" | "success";
export type ExamDifficulty = "easy" | "medium" | "hard";
export type CheatingType = "gaze" | "audio" | "tab_switch" | "screenshot" | "screen_record" | "multiple";
export type ExamStatus = "available" | "completed" | "in-progress" | "upcoming" | "draft" | "scheduled" | "active";

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
    lastActive?: string;
    department?: string;
    institution?: string;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}

export interface AdminUser extends User {
    role: "admin";
    studentNo?: string; // For students
}

// Student & Academic
export interface Student extends User {
    role: "student";
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
}

export interface Department {
    id: string;
    name: string;
    code?: string | null;
    createdAt?: Date | string | null;
    createdBy?: Date | string | null;
}

export interface Institution {
    id: string;
    name: string;
    code?: string | null;
    createdAt: Date | string;
    createdBy: string;
}

export interface Subject {
    id: string;
    title: string;
    code: string;
    section?: string; // Deprecated in favor of sections?
    sections?: string[]; // Array of section names or IDs
    department: string;
    createdAt: string | null;
    createdBy: string | null; // Name of proctor/creator
}

// Exam Configuration
export interface Exam {
    id: string;
    title: string;
    subject: string;
    description: string;
    duration: number; // in minutes
    questionCount: number;
    difficulty?: ExamDifficulty;
    scheduledDate?: string;
    passingScore: number;
    professor?: string;
    status: ExamStatus;
    // Proctor fields merged
    studentsCount?: number;
    assignedStudents?: number;
    createdAt?: string;
    createdBy?: string;
}

export interface ExamHistory {
    id: string;
    examId: string;
    examTitle: string;
    subject: string;
    dateTaken: string;
    score: number;
    totalScore: number;
    percentage: number;
    status: "passed" | "failed";
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
        faceDetection: boolean;
        tabSwitching: boolean;
        gazeTracking: boolean;
        audioDetection: boolean;
    };
    maxReconnectAttempts: number;
    autoSubmitTimeout: number; // in minutes
}

// Proctoring
export interface ProctorAssignment {
    id: string;
    proctorId: string;
    proctorName: string;
    examId: string;
    examName: string;
    assignedStudents: number;
    status: "active" | "completed" | "scheduled";
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

// Analytics & Reports
export interface AnalyticsReport {
    id: string;
    title: string;
    type: "completion" | "incident" | "performance";
    generatedAt: string;
    format: "pdf" | "csv" | "xlsx";
    status: "ready" | "generating" | "failed";
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
    targetAudience: ("all" | "students" | "proctors")[];
    status: "published" | "draft" | "scheduled";
    publishedAt?: string;
    author: string;
}

// Dashboard & Incidents
export type FlaggedIncident = {
    id: string;
    studentName: string;
    examName: string;
    incidentType: "face_not_visible" | "multiple_faces" | "tab_switch" | "audio_detected" | "suspicious_movement";
    severity: "high" | "medium" | "low";
    timestamp: string;
    status: "pending" | "reviewed" | "resolved";
};

// Calendar
export type TargetAudience = "all" | "students" | "proctors" | "specific_group";

export interface AdminEvent {
    id: string;
    date: Date;
    title: string;
    description: string;
    type: "event" | "announcement" | "maintenance";
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
export type ChatUserStatus = "online" | "offline" | "busy";

export interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    status: ChatUserStatus;
    role: "admin" | "proctor" | "student";
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
    semester: "1st" | "2nd" | "3rd" | "summer";
    isActive: boolean;
    createdAt?: string;
}

export interface Section {
    id: string;
    name: string; // e.g. "INF231"
    courseId?: string; // Optional if we link via subject/course code
    department: string; // Kept for easier display/filtering
    yearLevel: string; // e.g. "3rd Year"
    status: "active" | "archived" | "inactive";
    createdAt?: string;
    createdBy?: string;
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
    department: string;
    description?: string;
    createdAt: string;
    createdBy: string;
}

export interface MasterSubject {
    code: string; 
    title: string; 
    department: string;
    yearLevel: string;
    sections: string[];
}

export interface ActiveSession {
    id: string;
    studentName: string;
    examName: string;
    proctorName: string;
    duration: string;
    status: "live" | "paused" | "reviewing";
}