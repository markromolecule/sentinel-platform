import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type { ExamConfiguration, ExamSettings } from '@sentinel/shared/types';
import type { ExamStoreState } from './types';

export const DEFAULT_EXAM_SETTINGS: ExamSettings = {
    shuffleQuestions: true,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: true,
};

export const DEFAULT_EXAM_CONFIGURATION: ExamConfiguration = {
    lobbyAdmissionMode: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultLobbyAdmissionMode as
        | 'AUTOMATIC'
        | 'INSTRUCTOR_GATED',
    maxReconnectAttempts: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMaxReconnectAttempts,
    strictMode: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultStrictMode,
    screenLock: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultScreenLock,
    cameraRequired: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultCameraRequired,
    micRequired: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMicRequired,
    autoSubmitTimeoutMinutes: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAutoSubmitTimeoutMinutes,
    aiRules: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules },
    webSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity },
    mobileSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity },
};

export const DEFAULT_SECTION_TITLE = 'Section 1';

export const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DEFAULT_EXAM_STORE_STATE: ExamStoreState = {
    examId: null,
    title: 'Untitled Exam',
    description: '',
    classroomId: null,
    classroomName: 'Classroom',
    subjectId: null,
    subject: 'General Subject',
    section: '',
    sectionIds: [],
    startDateTime: null,
    endDateTime: null,
    durationMinutes: 60,
    passingScore: 75,
    settings: { ...DEFAULT_EXAM_SETTINGS },
    configuration: { ...DEFAULT_EXAM_CONFIGURATION },
    questionSections: [],
    questions: [],
    status: 'draft',
    isDirty: false,
};
