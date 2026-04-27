import type { MediaPipeCalibrationProfile } from '@sentinel/shared';

export const STUDENT_EXAM_STAGES = [
    'instruction',
    'privacy',
    'checkup',
    'lobby',
    'attempt',
] as const;

export type StudentExamStage = (typeof STUDENT_EXAM_STAGES)[number];

export const STUDENT_EXAM_FLOW_HEADER_STAGES = [
    'instruction',
    'privacy',
    'checkup',
    'lobby',
] as const;

export type StudentExamFlowHeaderStage = (typeof STUDENT_EXAM_FLOW_HEADER_STAGES)[number];

export type StudentExamMediaPipeActivationSource = 'checkup';

export type StudentExamMediaPipeSandboxLike = {
    enabled: boolean;
    captureDuringCheckup: boolean;
    emitDuringExam: boolean;
    confidenceThreshold: number;
    frameIntervalMs: number;
    offScreenDurationMs: number;
    calibrationRequired: boolean;
    debugOverlayEnabled: boolean;
};

export type StudentExamMediaPipeConfigurationLike = {
    cameraRequired: boolean;
    aiRules: {
        gaze_tracking: boolean;
        face_detection: boolean;
        multiple_faces_detection: boolean;
    };
};

export type StoredStudentExamFlow = {
    privacyAccepted: boolean;
    checkupCompleted: boolean;
    mediaPipeActivatedAt: string | null;
    mediaPipeCalibrationCompletedAt: string | null;
    mediaPipeActivationSource: StudentExamMediaPipeActivationSource | null;
    mediaPipeCalibrationProfile: MediaPipeCalibrationProfile | null;
};
