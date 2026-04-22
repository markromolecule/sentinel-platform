const STUDENT_EXAM_FLOW_STORAGE_PREFIX = 'sentinel-web:student-exam-flow';
export const STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS = 30 * 60 * 1000;

type StudentExamMediaPipeSandboxLike = {
    enabled: boolean;
    captureDuringCheckup: boolean;
    emitDuringExam: boolean;
    confidenceThreshold: number;
    frameIntervalMs: number;
    offScreenDurationMs: number;
    calibrationRequired: boolean;
    debugOverlayEnabled: boolean;
};

type StudentExamMediaPipeConfigurationLike = {
    cameraRequired: boolean;
    aiRules: {
        gaze_tracking: boolean;
        face_detection: boolean;
        multiple_faces_detection: boolean;
    };
};

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

export const STUDENT_EXAM_STAGE_LABELS: Record<StudentExamStage, string> = {
    instruction: 'Instruction',
    privacy: 'Privacy',
    checkup: 'Checkup',
    lobby: 'Lobby',
    attempt: 'Attempt',
};

export type StoredStudentExamFlow = {
    privacyAccepted: boolean;
    checkupCompleted: boolean;
    mediaPipeActivatedAt: string | null;
    mediaPipeCalibrationCompletedAt: string | null;
    mediaPipeActivationSource: StudentExamMediaPipeActivationSource | null;
};

const DEFAULT_STUDENT_EXAM_FLOW: StoredStudentExamFlow = {
    privacyAccepted: false,
    checkupCompleted: false,
    mediaPipeActivatedAt: null,
    mediaPipeCalibrationCompletedAt: null,
    mediaPipeActivationSource: null,
};

function buildStudentExamFlowStorageKey(examId: string) {
    return `${STUDENT_EXAM_FLOW_STORAGE_PREFIX}:${examId}`;
}

export function buildStudentExamHref(examId: string, stage: StudentExamStage) {
    return `/student/exam/${examId}/${stage}`;
}

export function resolveStudentExamMediaPipeSandbox(args: {
    configuration: StudentExamMediaPipeConfigurationLike | undefined;
    mediaPipeSandbox: StudentExamMediaPipeSandboxLike;
}): StudentExamMediaPipeSandboxLike {
    const { configuration, mediaPipeSandbox } = args;
    const requiresStudentExamMediaPipe = Boolean(
        configuration?.cameraRequired &&
        (configuration.aiRules.gaze_tracking ||
            configuration.aiRules.face_detection ||
            configuration.aiRules.multiple_faces_detection),
    );

    if (!requiresStudentExamMediaPipe) {
        return mediaPipeSandbox;
    }

    return {
        ...mediaPipeSandbox,
        enabled: true,
        captureDuringCheckup: true,
        emitDuringExam: true,
        calibrationRequired: true,
    };
}

function normalizeStoredDate(value: unknown) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return null;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeStoredActivationSource(
    value: unknown,
): StudentExamMediaPipeActivationSource | null {
    return value === 'checkup' ? value : null;
}

export function readStoredStudentExamFlow(examId: string): StoredStudentExamFlow {
    if (typeof window === 'undefined') {
        return DEFAULT_STUDENT_EXAM_FLOW;
    }

    const rawValue = window.sessionStorage.getItem(buildStudentExamFlowStorageKey(examId));

    if (!rawValue) {
        return DEFAULT_STUDENT_EXAM_FLOW;
    }

    try {
        const parsedValue = JSON.parse(rawValue) as Partial<StoredStudentExamFlow> | null;

        return {
            privacyAccepted: parsedValue?.privacyAccepted === true,
            checkupCompleted: parsedValue?.checkupCompleted === true,
            mediaPipeActivatedAt: normalizeStoredDate(parsedValue?.mediaPipeActivatedAt),
            mediaPipeCalibrationCompletedAt: normalizeStoredDate(
                parsedValue?.mediaPipeCalibrationCompletedAt,
            ),
            mediaPipeActivationSource: normalizeStoredActivationSource(
                parsedValue?.mediaPipeActivationSource,
            ),
        };
    } catch {
        window.sessionStorage.removeItem(buildStudentExamFlowStorageKey(examId));
        return DEFAULT_STUDENT_EXAM_FLOW;
    }
}

export function writeStoredStudentExamFlow(examId: string, value: StoredStudentExamFlow) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(buildStudentExamFlowStorageKey(examId), JSON.stringify(value));
}

export function patchStoredStudentExamFlow(examId: string, patch: Partial<StoredStudentExamFlow>) {
    const currentValue = readStoredStudentExamFlow(examId);
    const nextValue = {
        ...currentValue,
        ...patch,
    };

    writeStoredStudentExamFlow(examId, nextValue);

    return nextValue;
}

export function resolveStoredStudentExamMediaPipeActivation(args: {
    examId: string;
    required: boolean;
    maxAgeMs?: number;
    nowMs?: number;
}) {
    const storedFlow = readStoredStudentExamFlow(args.examId);

    if (!args.required) {
        return {
            status: 'not-required' as const,
            isValid: true,
            storedFlow,
            ageMs: null,
        };
    }

    if (
        storedFlow.mediaPipeActivationSource !== 'checkup' ||
        !storedFlow.mediaPipeActivatedAt ||
        !storedFlow.mediaPipeCalibrationCompletedAt
    ) {
        return {
            status: 'missing' as const,
            isValid: false,
            storedFlow,
            ageMs: null,
        };
    }

    const activatedAtMs = new Date(storedFlow.mediaPipeActivatedAt).getTime();
    const ageMs = Math.max(0, (args.nowMs ?? Date.now()) - activatedAtMs);

    if (ageMs > (args.maxAgeMs ?? STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS)) {
        return {
            status: 'stale' as const,
            isValid: false,
            storedFlow,
            ageMs,
        };
    }

    return {
        status: 'ready' as const,
        isValid: true,
        storedFlow,
        ageMs,
    };
}
