import {
    ExamAttemptAnswers,
    ExamQuestion,
    ExamStatus,
    ExamRuntimeAccess,
    ExamRuntimeAccessState,
    StudentExamAccessOverride,
    StudentExamAccessOverrideType,
    InternalExamStatus,
    ProctorExam,
    StudentExamStatus,
    Flag,
    StudentSession,
    ExamReport,
} from '@sentinel/shared/types';

export interface ApiExamResponse<T> {
    message: string;
    data: T;
}

export interface ApiExamSection {
    id: string;
    title: string;
    description?: string | null;
    orderIndex: number;
}

export interface ApiExamQuestion {
    id: string;
    examId: string;
    sectionId?: string | null;
    sourceQuestionBankQuestionId?: string | null;
    sourceCollectionId?: string | null;
    sourceOrigin?: ExamQuestion['sourceOrigin'];
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type: ExamQuestion['type'];
    points: number;
    orderIndex: number;
    content: ExamQuestion['content'];
    tags?: string[];
}

export interface ApiExamSummary {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    passingScore: number;
    status: ExamStatus;
    classroomId: string | null;
    classroomName: string | null;
    subjectId: string | null;
    subjectTitle: string | null;
    sectionId: string | null;
    sectionName: string | null;
    roomId: string | null;
    roomName: string | null;
    scheduledDate: string | null;
    endDateTime: string | null;
    publishedAt: string | null;
    questionCount: number;
    createdAt: string | null;
    updatedAt: string | null;
    assigned_section_ids?: string[] | null;
    attemptId?: string | null;
    completedAt?: string | null;
    score?: number | null;
    totalScore?: number | null;
    percentage?: number | null;
    timeSpentMinutes?: number | null;
    cheated?: boolean;
    cheatingType?: string | null;
    incidentCount?: number;
    runtimeAccess?: ExamRuntimeAccess;
    mediaPipeSandbox?: ProctorExam['mediaPipeSandbox'];
}

export interface ApiExamDetail extends ApiExamSummary {
    settings: NonNullable<ProctorExam['settings']>;
    configuration: NonNullable<ProctorExam['configuration']>;
    questionSections: ApiExamSection[];
    questions: ApiExamQuestion[];
}

export interface ApiMonitoringExam {
    id: string;
    title: string;
    subject: string;
    scheduledDate: string | null;
    endDateTime: string | null;
    maxReconnectAttempts: number;
    runtimeAccess?: ExamRuntimeAccess;
}

export interface ApiMonitoringStats {
    total: number;
    active: number;
    flagged: number;
    submitted: number;
    disconnected: number;
}

export interface ApiMonitoringStudentSummary {
    id: string;
    studentRecordId: string;
    attemptId: string;
    studentNo: string;
    firstName: string;
    lastName: string;
    status: StudentSession['status'];
    progress: number;
    incidentCount: number;
    openIncidentCount: number;
    latestIncidentType: Flag['type'] | null;
    lastActivityAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    timeSpentMinutes: number | null;
    reconnectCount: number;
    score?: number | null;
    totalScore?: number | null;
}

export interface ApiMonitoringIncident {
    id: string;
    type: Flag['type'];
    rawEventType?: Flag['rawEventType'];
    timestamp: string;
    description: string;
    severity: Flag['severity'];
    snapshotUrl?: string | null;
    evidenceUrl?: string | null;
    status?: Flag['status'];
    occurrenceCount?: number;
    severityReason?: Flag['severityReason'];
    persistenceTrigger?: Flag['persistenceTrigger'];
    matchingWindowSeconds?: Flag['matchingWindowSeconds'];
    wasSeverityForced?: boolean;
}

export interface ApiMonitoringStudentDetail extends ApiMonitoringStudentSummary {
    flags: ApiMonitoringIncident[];
}

export interface ApiMonitoringOverview {
    exam: ApiMonitoringExam;
    stats: ApiMonitoringStats;
    lobbyAdmissions: {
        waiting: number;
        approved: number;
        inAttempt: number;
    };
    students: ApiMonitoringStudentSummary[];
}

export interface ApiExamReportExam {
    id: string;
    title: string;
    subject: string;
    scheduledDate: string | null;
    endDateTime: string | null;
    durationMinutes: number;
    passingScore: number;
}

export interface ApiExamReportIncidentOutcomeSummary {
    pending: number;
    reviewed: number;
    confirmed: number;
    dismissed: number;
}

export interface ApiExamReportIncidentTypeBreakdown {
    type: Flag['type'];
    count: number;
}

export interface ApiExamReportIncidentSeverityBreakdown {
    severity: Flag['severity'];
    count: number;
}

export interface ApiExamReportActionItem {
    id: string;
    studentId: string;
    attemptId: string | null;
    studentNo: string;
    firstName: string;
    lastName: string;
    reason: string;
}

export interface ApiExamReportStudentSummary {
    id: string;
    studentId: string;
    attemptId: string | null;
    studentNo: string;
    firstName: string;
    lastName: string;
    sectionId: string | null;
    sectionName: string | null;
    status: ExamReport['students'][number]['status'];
    startedAt: string | null;
    completedAt: string | null;
    score: number | null;
    totalScore: number | null;
    percentage: number | null;
    timeSpentMinutes: number | null;
    incidentCount: number;
    openIncidentCount: number;
    primaryIncidentType: Flag['type'] | null;
    highestIncidentSeverity: Flag['severity'] | null;
    incidentOutcomes: ApiExamReportIncidentOutcomeSummary;
    submissionType: ExamReport['students'][number]['submissionType'];
    attemptKind: ExamReport['students'][number]['attemptKind'];
    attemptCount: number;
    isFlagged: boolean;
    needsReview: boolean;
    needsMakeup: boolean;
    needsRetake: boolean;
}

export interface ApiExamReportSummary {
    totalAssignedStudents: number;
    totalStarted: number;
    totalSubmitted: number;
    totalAbsent: number;
    flaggedStudentsCount: number;
    averageScore: number | null;
    passRate: number | null;
    incidentBreakdownByType: ApiExamReportIncidentTypeBreakdown[];
    incidentBreakdownBySeverity: ApiExamReportIncidentSeverityBreakdown[];
    needsReviewCount: number;
    needsMakeupCount: number;
    needsRetakeCount: number;
}

export interface ApiExamReportActionItems {
    review: ApiExamReportActionItem[];
    makeup: ApiExamReportActionItem[];
    retake: ApiExamReportActionItem[];
}

export interface ApiExamReport {
    exam: ApiExamReportExam;
    summary: ApiExamReportSummary;
    students: ApiExamReportStudentSummary[];
    actionItems: ApiExamReportActionItems;
}

export type GetExamsParams = {
    search?: string;
    status?: ExamStatus;
    subjectId?: string;
    classroomId?: string;
};

export type CreateExamPayload = {
    title: string;
    description: string;
    classroomId?: string;
    classroomName?: string;
    subjectId?: string;
    section?: string;
    sectionId?: string;
    sectionIds?: string[];
    roomId?: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    passingScore: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    randomizeChoices: boolean;
    settings?: ProctorExam['settings'];
    configuration?: ProctorExam['configuration'];
};

export type UpdateExamQuestionSectionPayload = {
    id?: string;
    title: string;
    description?: string | null;
    orderIndex: number;
};

export type UpdateExamQuestionPayload = {
    id?: string;
    sectionId?: string | null;
    sourceQuestionBankQuestionId?: string | null;
    sourceCollectionId?: string | null;
    sourceOrigin?: ExamQuestion['sourceOrigin'];
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type: ExamQuestion['type'];
    points: number;
    orderIndex: number;
    content: ExamQuestion['content'];
};

export type UpdateExamPayload = Omit<
    Partial<CreateExamPayload>,
    'subjectId' | 'section' | 'sectionId' | 'roomId' | 'classroomId'
> & {
    classroomId?: string | null;
    classroomName?: string | null;
    subjectId?: string | null;
    section?: string | null;
    sectionId?: string | null;
    sectionIds?: string[] | null;
    roomId?: string | null;
    settings?: ProctorExam['settings'];
    configuration?: ProctorExam['configuration'];
    questionSections?: UpdateExamQuestionSectionPayload[];
    questions?: UpdateExamQuestionPayload[];
    status?: InternalExamStatus | StudentExamStatus;
};

export type UpdateExamStatusPayload = {
    id: string;
    status: ExamStatus;
};

export type UpdateExamRuntimeAccessPayload = {
    id: string;
    state: Exclude<ExamRuntimeAccessState, 'before_start' | 'lobby_approved' | 'lobby_waiting'>;
    reopenedUntil?: string | null;
};

export type CreateStudentExamAccessOverridePayload = {
    id: string;
    studentId: string;
    overrideType: StudentExamAccessOverrideType;
    availableFrom: string;
    availableUntil: string;
    allowedAttempts?: number;
    sourceAttemptId?: string | null;
    notes?: string | null;
};

export type OverrideReconnectLimitPayload = {
    id: string;
    studentId: string;
    reason?: string | null;
};

export type ApiStudentExamAccessOverride = StudentExamAccessOverride;

export type ExamConfigurationState = {
    settings: NonNullable<ProctorExam['settings']>;
    configuration: NonNullable<ProctorExam['configuration']>;
};

export type StartExamSessionPayload = {
    examId: string;
};

export type StartExamSessionResult = {
    sessionId?: string;
    configSnapshot?: ExamConfigurationState;
    isResumed?: boolean;
    answers?: ExamAttemptAnswers;
    elapsedSeconds?: number;
    reconnectAttemptCount?: number;
    maxReconnectAttempts?: number;
    attemptId?: string;
    error?: string;
    errorCode?: 'ATTEMPT_ALREADY_COMPLETED';
};

export type CompleteExamSessionPayload = {
    sessionId: string;
    answers: ExamAttemptAnswers;
    elapsedSeconds: number;
};

export type CompleteExamSessionResult = import('@sentinel/shared/types').ExamAttemptScoreSummary & {
    attemptId: string;
    completedAt: string;
};

export type SyncExamProgressPayload = {
    sessionId: string;
    answeredCount: number;
    elapsedSeconds: number;
    answers?: ExamAttemptAnswers;
};

export type SyncExamProgressResult = {
    message: string;
};
