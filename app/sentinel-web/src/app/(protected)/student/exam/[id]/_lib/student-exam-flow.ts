const STUDENT_EXAM_FLOW_STORAGE_PREFIX = 'sentinel-web:student-exam-flow';

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
};

const DEFAULT_STUDENT_EXAM_FLOW: StoredStudentExamFlow = {
    privacyAccepted: false,
    checkupCompleted: false,
};

function buildStudentExamFlowStorageKey(examId: string) {
    return `${STUDENT_EXAM_FLOW_STORAGE_PREFIX}:${examId}`;
}

export function buildStudentExamHref(examId: string, stage: StudentExamStage) {
    return `/student/exam/${examId}/${stage}`;
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
