import type { ProctorInfo, Student, ProctorExam, NavigationItem } from '../../types/proctor';
import type { Announcement } from '../../types';
export declare const MOCK_PROCTOR: ProctorInfo;
export declare const MOCK_STUDENTS: Student[];
export declare const MOCK_PROCTOR_EXAMS: ProctorExam[];
export declare const PROCTOR_NAV_ITEMS: NavigationItem[];
export declare const MOCK_ANNOUNCEMENTS: Announcement[];
export declare const MOCK_DASHBOARD_STATS: {
    totalStudents: number;
    activeExams: number;
    examsToday: number;
    unreadMessages: number;
};
export declare const MOCK_AVAILABLE_SUBJECTS: {
    code: string;
    title: string;
    department: string;
}[];
export declare const MOCK_SECTIONS: string[];
export declare const MOCK_ACTIVE_SESSIONS: import("../../types").ActiveSession[];
export declare const MOCK_FLAGGED_INCIDENTS: import("../../types").FlaggedIncident[];
export declare const MOCK_EXAM_COMPLETION_DATA: {
    name: string;
    completed: number;
    dropped: number;
}[];
export declare const MOCK_INCIDENT_TRENDS: {
    name: string;
    incidents: number;
}[];
export declare const INCIDENT_LABELS: Record<"tab_switch" | "face_not_visible" | "multiple_faces" | "audio_detected" | "suspicious_movement", string>;
export declare const MOCK_ADMIN_EVENTS: import("../../types").AdminEvent[];
//# sourceMappingURL=index.d.ts.map