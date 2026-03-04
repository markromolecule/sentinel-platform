import { User, SystemStat, Activity, ExamConfig, ProctorAssignment, AnalyticsReport, AuditLog, Announcement, FlaggedIncident, AdminEvent, Section, ChatUser, Conversation, Course, MasterSubject, Subject, ActiveSession } from '../types';
type MockUser = User & {
    studentNo?: string;
};
export declare const MOCK_ADMIN_USERS: MockUser[];
export declare const MOCK_SYSTEM_STATS: SystemStat[];
export declare const MOCK_RECENT_ACTIVITY: Activity[];
export declare const MOCK_EXAM_CONFIG: ExamConfig;
export declare const MOCK_PROCTOR_ASSIGNMENTS: ProctorAssignment[];
export declare const MOCK_REPORTS: AnalyticsReport[];
export declare const MOCK_AUDIT_LOGS: AuditLog[];
export declare const MOCK_ANNOUNCEMENTS: Announcement[];
export declare const MOCK_EXAM_COMPLETION_DATA: {
    name: string;
    completed: number;
    dropped: number;
}[];
export declare const MOCK_INCIDENT_TRENDS: {
    name: string;
    incidents: number;
}[];
export declare const MOCK_FLAGGED_INCIDENTS: FlaggedIncident[];
export declare const INCIDENT_LABELS: Record<FlaggedIncident['incidentType'], string>;
export declare const MOCK_ADMIN_EVENTS: AdminEvent[];
export declare const MOCK_SECTIONS: Omit<Section, 'status'>[];
export declare const MOCK_CHAT_USERS: ChatUser[];
export declare const MOCK_CONVERSATIONS: Conversation[];
export declare const MOCK_MESSAGES: Record<string, any[]>;
export declare const MOCK_COURSES: Course[];
export declare const MOCK_SUBJECTS: Subject[];
export declare const MOCK_MASTER_SUBJECTS: MasterSubject[];
export declare const MOCK_ACTIVE_SESSIONS: ActiveSession[];
export declare const MOCK_PROCTOR_OPTIONS: {
    id: string;
    name: string;
}[];
export declare const MOCK_EXAM_OPTIONS: {
    id: string;
    name: string;
}[];
export {};
//# sourceMappingURL=index.d.ts.map