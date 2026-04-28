import { type StudentExamStage } from '../_types';

export const STUDENT_EXAM_FLOW_STORAGE_PREFIX = 'sentinel-web:student-exam-flow';
export const STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS = 30 * 60 * 1000;

export const STUDENT_EXAM_STAGE_LABELS: Record<StudentExamStage, string> = {
    instruction: 'Instruction',
    privacy: 'Privacy',
    checkup: 'Checkup',
    lobby: 'Lobby',
    attempt: 'Attempt',
};

export const DEFAULT_STUDENT_EXAM_FLOW = {
    privacyAccepted: false,
    checkupCompleted: false,
    mediaPipeActivatedAt: null,
    mediaPipeCalibrationCompletedAt: null,
    mediaPipeActivationSource: null,
    mediaPipeCalibrationProfile: null,
} as const;
