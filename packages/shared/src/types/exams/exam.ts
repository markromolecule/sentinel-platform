import type { TelemetryMediaPipeSandboxSchemaValues } from '../../schema/telemetry/telemetry-settings-schema';

export type InternalExamStatus =
    | 'available'
    | 'completed'
    | 'in-progress'
    | 'upcoming'
    | 'draft'
    | 'scheduled'
    | 'active'
    | 'published'
    | 'archived';

export type StudentExamStatus = 'upcoming' | 'available' | 'in-progress' | 'past_due' | 'turned_in';
export type ExamRuntimeAccessState = 'before_start' | 'open' | 'locked' | 'reopened' | 'closed';
export type ExamRuntimeAccessReasonCode = 'NOT_STARTED' | 'OPEN' | 'LOCKED' | 'REOPENED' | 'CLOSED';
export type StudentExamAccessOverrideType = 'MAKEUP' | 'RETAKE' | 'REOPEN';

export type ExamRuntimeAccess = {
    state: ExamRuntimeAccessState;
    reasonCode: ExamRuntimeAccessReasonCode;
    message: string;
    canStart: boolean;
    canResume: boolean;
    hasActiveAttempt: boolean;
    startsAt?: string | Date | null;
    endsAt?: string | Date | null;
    reopenedUntil?: string | Date | null;
};

export type StudentExamAccessOverride = {
    id: string;
    examId: string;
    studentId: string;
    grantedBy?: string | null;
    overrideType: StudentExamAccessOverrideType;
    availableFrom: string | Date;
    availableUntil: string | Date;
    allowedAttempts: number;
    usedAttempts: number;
    usedAttemptIds: string[];
    sourceAttemptId?: string | null;
    notes?: string | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
};

export type ExamStatus = InternalExamStatus | StudentExamStatus;
export type ExamHistoryCheatingType =
    | 'gaze'
    | 'audio'
    | 'tab_switch'
    | 'screenshot'
    | 'screen_record'
    | 'multiple';

export type QuestionType =
    | 'MULTIPLE_CHOICE'
    | 'MULTIPLE_RESPONSE'
    | 'TRUE_FALSE'
    | 'IDENTIFICATION'
    | 'MATCHING'
    | 'ESSAY'
    | 'FILL_BLANK'
    | 'ENUMERATION';

export type QuestionDifficulty = 'EASY' | 'MODERATE' | 'HARD';
export type QuestionSourceOrigin = 'MANUAL' | 'AI_PDF';

export type ExamSettings = {
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    randomizeChoices: boolean;
};

export type ExamConfiguration = {
    maxReconnectAttempts: number;
    strictMode: boolean;
    screenLock: boolean;
    cameraRequired: boolean;
    micRequired: boolean;
    autoSubmitTimeoutMinutes: number;
    aiRules: {
        gaze_tracking: boolean;
        face_detection: boolean;
        audio_anomaly_detection: boolean;
        multiple_faces_detection: boolean;
    };
    webSecurity: {
        tab_switching_monitor: boolean;
        full_screen_required: boolean;
        clipboard_control: boolean;
        right_click_disable: boolean;
        print_screen_disable: boolean;
    };
    mobileSecurity: {
        app_pinning_required: boolean;
        prevent_backgrounding: boolean;
        notification_block: boolean;
        screenshot_block: boolean;
        root_jailbreak_detection: boolean;
    };
};

export type MatchingPair = {
    left: string;
    right: string;
};

export type ExamAttemptAnswerValue =
    | string
    | number
    | boolean
    | (string | number)[]
    | Record<string, string>
    | null
    | undefined;

export type ExamAttemptAnswers = Record<string, ExamAttemptAnswerValue>;

export type ExamAttemptScoreSummary = {
    score: number;
    totalScore: number;
    percentage: number | null;
    answeredCount: number;
    autoGradableQuestionCount: number;
    manualReviewQuestionCount: number;
    requiresManualReview: boolean;
};

export type ExamQuestionContent = {
    prompt: string;
    options?: string[];
    correctAnswer?: string | number | boolean | string[] | number[];
    acceptedAnswers?: string[];
    rubric?: string;
    maxLength?: number;
    correctBoolean?: boolean;
    pairs?: MatchingPair[];
    blanks?: string[];
    caseSensitive?: boolean;
};

export type ExamQuestionSection = {
    id: string;
    title: string;
    orderIndex: number;
    isCollapsed?: boolean;
};

export type ExamQuestion = {
    id: string;
    examId: string;
    sourceQuestionBankQuestionId?: string;
    sourceCollectionId?: string;
    sourceOrigin?: QuestionSourceOrigin;
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    type: QuestionType;
    difficulty?: QuestionDifficulty;
    points: number;
    orderIndex: number;
    sectionId?: string;
    tags: string[];
    content: ExamQuestionContent;
};

export type ExamShareSettings = {
    visibility: 'public' | 'private' | 'password';
    password?: string;
    link: string;
    embedCode: string;
};

export type ExamAssignment = {
    studentIds: string[];
    groupIds: string[];
    dueDate: string;
    dueTime: string;
    instructions: string;
    notify: boolean;
};

export type Exam = {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    passingScore: number;
    status: ExamStatus;
    settings?: ExamSettings;
    configuration?: ExamConfiguration;
    questions?: ExamQuestion[];
    questionSections?: ExamQuestionSection[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    share?: ExamShareSettings;
    assignment?: ExamAssignment;
    classroomId?: string;
    classroomName?: string;
    subject: string;
    subjectId?: string;
    section?: string;
    sectionIds?: string[];
    sectionNames?: string[];
    room?: string;
    roomId?: string;
    studentsCount?: number;
    questionCount?: number;
    scheduledDate?: string;
    endDateTime?: string;
    attemptId?: string | null;
    completedAt?: string | null;
    score?: number | null;
    totalScore?: number | null;
    percentage?: number | null;
    timeSpentMinutes?: number | null;
    cheated?: boolean;
    cheatingType?: ExamHistoryCheatingType | null;
    incidentCount?: number;
    runtimeAccess?: ExamRuntimeAccess;
    mediaPipeSandbox?: TelemetryMediaPipeSandboxSchemaValues;
    // Legacy support (optional)
    difficulty?: 'easy' | 'medium' | 'hard';
    professor?: string;
};

export type ExamSetupDraft = {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    settings: ExamSettings;
};

export type QuestionTypeOption = {
    value: QuestionType;
    label: string;
    description: string;
};
