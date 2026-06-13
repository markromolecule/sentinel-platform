import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { SaveBuilderWorkspacePayload } from '@sentinel/services';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type {
    ExamConfiguration,
    ExamQuestion,
    ExamQuestionSection,
    ExamSettings,
    ProctorExam,
} from '@sentinel/shared/types';

export type ExamStatus = 'draft' | 'published';

const DEFAULT_EXAM_SETTINGS: ExamSettings = {
    shuffleQuestions: true,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: true,
};

const DEFAULT_EXAM_CONFIGURATION: ExamConfiguration = {
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

const DEFAULT_SECTION_TITLE = 'Section 1';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const generateSectionId = () => crypto.randomUUID();

const createQuestionSection = (
    index: number,
    title = `Section ${index + 1}`,
): ExamQuestionSection => ({
    id: generateSectionId(),
    title,
    description: null,
    orderIndex: index,
    isCollapsed: false,
});

const getEndDateTime = (
    startDateTime?: string,
    durationMinutes?: number,
    fallbackEndDateTime?: string,
) => {
    if (fallbackEndDateTime) {
        return fallbackEndDateTime;
    }

    if (!startDateTime || !durationMinutes) {
        return null;
    }

    const start = new Date(startDateTime);

    if (Number.isNaN(start.getTime())) {
        return null;
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    return end.toISOString();
};

export interface ExamStoreState {
    examId: string | null;
    title: string;
    description: string;
    classroomId: string | null;
    classroomName: string;
    subjectId: string | null;
    subject: string;
    section: string;
    sectionIds: string[];
    startDateTime: string | null;
    endDateTime: string | null;
    durationMinutes: number;
    passingScore: number;
    settings: ExamSettings;
    configuration: ExamConfiguration;
    questionSections: ExamQuestionSection[];
    questions: ExamQuestion[];
    status: ExamStatus;
    isDirty: boolean;
}

export interface ExamStoreActions {
    hydrateExam: (exam: ProctorExam) => void;
    setSetupDraft: (setup: {
        examId: string;
        title: string;
        description: string;
        classroomId: string;
        classroomName: string;
        subjectId: string;
        subject: string;
        section: string;
        sectionIds: string[];
        startDateTime: string;
        endDateTime: string;
        durationMinutes: number;
        passingScore: number;
        settings: ExamSettings;
        configuration?: ExamConfiguration;
    }) => void;
    setExamId: (id: string) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    markClean: () => void;
    updateSetting: <K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) => void;
    updateConfiguration: <K extends keyof ExamConfiguration>(
        key: K,
        value: ExamConfiguration[K],
    ) => void;
    addQuestionSection: (title?: string) => void;
    updateQuestionSection: (sectionId: string, updates: Partial<ExamQuestionSection>) => void;
    deleteQuestionSection: (sectionId: string) => void;
    toggleQuestionSectionCollapse: (sectionId: string) => void;
    reorderQuestionSections: (startIndex: number, endIndex: number) => void;
    setQuestions: (questions: ExamQuestion[]) => void;
    addQuestion: (question: ExamQuestion) => void;
    updateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    deleteQuestion: (id: string) => void;
    reorderQuestions: (startIndex: number, endIndex: number) => void;
    reorderQuestionsInSection: (sectionId: string, startIndex: number, endIndex: number) => void;
}

export type ExamStore = ExamStoreState & ExamStoreActions;

function normalizeExamStructure(
    questions: ExamQuestion[],
    questionSections?: ExamQuestionSection[],
) {
    const normalizedSections = [...(questionSections ?? [])]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((section, index) => ({
            ...section,
            orderIndex: index,
            isCollapsed: section.isCollapsed ?? false,
        }));

    const ensuredSections =
        normalizedSections.length > 0
            ? normalizedSections
            : [createQuestionSection(0, DEFAULT_SECTION_TITLE)];

    const groupedQuestions = new Map<string, ExamQuestion[]>(
        ensuredSections.map((section) => [section.id, []]),
    );
    const validSectionIds = new Set(ensuredSections.map((section) => section.id));
    const defaultSectionId = ensuredSections[0].id;

    [...questions]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .forEach((question) => {
            const sectionId =
                question.sectionId && validSectionIds.has(question.sectionId)
                    ? question.sectionId
                    : defaultSectionId;

            groupedQuestions.get(sectionId)?.push({
                ...question,
                sectionId,
            });
        });

    const normalizedQuestions = ensuredSections
        .flatMap((section) =>
            (groupedQuestions.get(section.id) ?? []).map((question) => ({
                ...question,
                sectionId: section.id,
            })),
        )
        .map((question, index) => ({
            ...question,
            orderIndex: index,
        }));

    return {
        questionSections: ensuredSections,
        questions: normalizedQuestions,
    };
}

function isUuid(value?: string | null) {
    return Boolean(value && UUID_PATTERN.test(value));
}

function createDefaultState(): ExamStoreState {
    return {
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
        questionSections: [createQuestionSection(0, DEFAULT_SECTION_TITLE)],
        questions: [],
        status: 'draft',
        isDirty: false,
    };
}

export function buildBuilderWorkspacePayload(state: ExamStoreState): SaveBuilderWorkspacePayload {
    const sectionIdMap = new Map<string, string>();

    const normalizedSections = state.questionSections
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((section, index) => {
            const nextId = isUuid(section.id) ? section.id : crypto.randomUUID();
            sectionIdMap.set(section.id, nextId);

            return {
                id: nextId,
                title: section.title,
                description: section.description?.trim() || null,
                orderIndex: index,
            };
        });

    const normalizedQuestions = state.questions
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((question, index) => ({
            ...(isUuid(question.id) ? { id: question.id } : {}),
            ...(question.sectionId
                ? { sectionId: sectionIdMap.get(question.sectionId) ?? question.sectionId }
                : {}),
            ...(question.sourceQuestionBankQuestionId
                ? { sourceQuestionBankQuestionId: question.sourceQuestionBankQuestionId }
                : {}),
            ...(question.sourceCollectionId
                ? { sourceCollectionId: question.sourceCollectionId }
                : {}),
            ...(question.sourceOrigin ? { sourceOrigin: question.sourceOrigin } : {}),
            ...(question.sourceFileName ? { sourceFileName: question.sourceFileName } : {}),
            ...(question.sourcePageNumber ? { sourcePageNumber: question.sourcePageNumber } : {}),
            ...(question.sourceEvidence ? { sourceEvidence: question.sourceEvidence } : {}),
            type: question.type,
            points: question.points,
            orderIndex: index,
            content: question.content,
        }));

    return {
        title: state.title,
        description: state.description,
        classroomId: state.classroomId ?? undefined,
        subjectId: state.subjectId ?? undefined,
        section: state.section || undefined,
        startDateTime: state.startDateTime ?? undefined,
        endDateTime:
            state.endDateTime ||
            getEndDateTime(state.startDateTime || undefined, state.durationMinutes) ||
            undefined,
        durationMinutes: state.durationMinutes,
        passingScore: state.passingScore,
        settings: { ...state.settings },
        configuration: { ...state.configuration },
        shuffleQuestions: state.settings.shuffleQuestions,
        showCorrectAnswers: state.settings.showCorrectAnswers,
        allowReview: state.settings.allowReview,
        randomizeChoices: state.settings.randomizeChoices,
        questionSections: normalizedSections,
        questions: normalizedQuestions,
    };
}

export const useExamStore = create(
    immer<ExamStore>((set) => ({
        ...createDefaultState(),

        hydrateExam: (exam) => {
            const normalizedStructure = normalizeExamStructure(
                exam.questions || [],
                exam.questionSections,
            );

            set((state) => {
                const shouldPreserveLocalQuestions = state.examId === exam.id && state.isDirty;

                state.examId = exam.id;
                state.title = exam.title;
                state.description = exam.description || '';
                state.classroomId = exam.classroomId || null;
                state.classroomName = exam.classroomName || 'Classroom';
                state.subjectId = exam.subjectId || null;
                state.subject = exam.subject || 'General Subject';
                state.section = exam.section || '';
                state.sectionIds = exam.sectionIds || [];
                state.startDateTime = exam.scheduledDate || null;
                state.endDateTime = getEndDateTime(
                    exam.scheduledDate,
                    exam.duration,
                    exam.endDateTime,
                );
                state.durationMinutes = exam.duration || 60;
                state.passingScore = exam.passingScore || 75;
                state.settings = exam.settings || { ...DEFAULT_EXAM_SETTINGS };
                state.configuration = exam.configuration || { ...DEFAULT_EXAM_CONFIGURATION };
                if (!shouldPreserveLocalQuestions) {
                    state.questionSections = normalizedStructure.questionSections;
                    state.questions = normalizedStructure.questions;
                    state.isDirty = false;
                }
                state.status = exam.status === 'published' ? 'published' : 'draft';
            });
        },

        setSetupDraft: (setup) => {
            set((state) => {
                state.examId = setup.examId;
                state.title = setup.title;
                state.description = setup.description;
                state.classroomId = setup.classroomId;
                state.classroomName = setup.classroomName;
                state.subjectId = setup.subjectId;
                state.subject = setup.subject;
                state.section = setup.section;
                state.sectionIds = setup.sectionIds;
                state.startDateTime = setup.startDateTime;
                state.endDateTime = setup.endDateTime;
                state.durationMinutes = setup.durationMinutes;
                state.passingScore = setup.passingScore;
                state.settings = { ...setup.settings };
                state.configuration = setup.configuration || { ...DEFAULT_EXAM_CONFIGURATION };
                state.questionSections = [createQuestionSection(0, DEFAULT_SECTION_TITLE)];
                state.questions = [];
                state.status = 'draft';
                state.isDirty = false;
            });
        },

        setExamId: (id) => {
            set((state) => {
                state.examId = id;
            });
        },

        setTitle: (title) => {
            set((state) => {
                state.title = title;
                state.isDirty = true;
            });
        },

        setDescription: (description) => {
            set((state) => {
                state.description = description;
                state.isDirty = true;
            });
        },

        markClean: () => {
            set((state) => {
                state.isDirty = false;
            });
        },

        updateSetting: (key, value) => {
            set((state) => {
                state.settings[key] = value;
                state.isDirty = true;
            });
        },

        updateConfiguration: (key, value) => {
            set((state) => {
                state.configuration[key] = value;
                state.isDirty = true;
            });
        },

        addQuestionSection: (title) => {
            set((state) => {
                state.questionSections.push(
                    createQuestionSection(
                        state.questionSections.length,
                        title || `Section ${state.questionSections.length + 1}`,
                    ),
                );
                state.isDirty = true;
            });
        },

        updateQuestionSection: (sectionId, updates) => {
            set((state) => {
                const sectionIndex = state.questionSections.findIndex(
                    (section) => section.id === sectionId,
                );
                if (sectionIndex !== -1) {
                    Object.assign(state.questionSections[sectionIndex], updates);
                    state.isDirty = true;
                }
            });
        },

        deleteQuestionSection: (sectionId) => {
            set((state) => {
                if (state.questionSections.length <= 1) {
                    return;
                }

                const remainingSections = state.questionSections.filter(
                    (section) => section.id !== sectionId,
                );
                const remainingQuestions = state.questions.filter(
                    (question) => question.sectionId !== sectionId,
                );
                const normalizedStructure = normalizeExamStructure(
                    remainingQuestions,
                    remainingSections,
                );

                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },

        toggleQuestionSectionCollapse: (sectionId) => {
            set((state) => {
                const sectionIndex = state.questionSections.findIndex(
                    (section) => section.id === sectionId,
                );
                if (sectionIndex !== -1) {
                    state.questionSections[sectionIndex].isCollapsed =
                        !state.questionSections[sectionIndex].isCollapsed;
                    state.isDirty = true;
                }
            });
        },

        reorderQuestionSections: (startIndex, endIndex) => {
            set((state) => {
                const reorderedSections = Array.from(state.questionSections);
                const [movedSection] = reorderedSections.splice(startIndex, 1);

                if (!movedSection) {
                    return;
                }

                reorderedSections.splice(endIndex, 0, movedSection);
                const sectionsWithUpdatedOrder = reorderedSections.map((section, index) => ({
                    ...section,
                    orderIndex: index,
                }));

                const normalizedStructure = normalizeExamStructure(
                    state.questions,
                    sectionsWithUpdatedOrder,
                );
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },

        setQuestions: (questions) => {
            set((state) => {
                const normalizedStructure = normalizeExamStructure(
                    questions,
                    state.questionSections,
                );
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },

        addQuestion: (question) => {
            set((state) => {
                const defaultSectionId = state.questionSections[0]?.id;
                const normalizedStructure = normalizeExamStructure(
                    [
                        ...state.questions,
                        {
                            ...question,
                            sectionId: question.sectionId || defaultSectionId,
                        },
                    ],
                    state.questionSections,
                );

                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },

        updateQuestion: (id, updates) => {
            set((state) => {
                const index = state.questions.findIndex((q) => q.id === id);
                if (index !== -1) {
                    Object.assign(state.questions[index], updates);
                    state.isDirty = true;
                }
            });
        },

        deleteQuestion: (id) => {
            set((state) => {
                const normalizedStructure = normalizeExamStructure(
                    state.questions.filter((q) => q.id !== id),
                    state.questionSections,
                );

                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },

        reorderQuestions: (startIndex, endIndex) => {
            set((state) => {
                const result = Array.from(state.questions);
                const [movedQuestion] = result.splice(startIndex, 1);

                if (!movedQuestion) {
                    return;
                }

                result.splice(endIndex, 0, movedQuestion);
                const questionsWithUpdatedOrder = result.map((question, index) => ({
                    ...question,
                    orderIndex: index,
                }));
                const normalizedStructure = normalizeExamStructure(
                    questionsWithUpdatedOrder,
                    state.questionSections,
                );
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },

        reorderQuestionsInSection: (sectionId, startIndex, endIndex) => {
            set((state) => {
                const groupedQuestions = new Map<string, ExamQuestion[]>(
                    state.questionSections.map((section) => [section.id, []]),
                );

                state.questions.forEach((question) => {
                    const targetSectionId = question.sectionId || state.questionSections[0]?.id;
                    if (!targetSectionId) {
                        return;
                    }

                    groupedQuestions.get(targetSectionId)?.push({
                        ...question,
                        sectionId: targetSectionId,
                    });
                });

                const sectionQuestions = groupedQuestions.get(sectionId) || [];
                const [movedQuestion] = sectionQuestions.splice(startIndex, 1);

                if (!movedQuestion) {
                    return;
                }

                sectionQuestions.splice(endIndex, 0, movedQuestion);
                groupedQuestions.set(sectionId, sectionQuestions);

                const reorderedQuestions = state.questionSections
                    .flatMap((section) => groupedQuestions.get(section.id) || [])
                    .map((question, index) => ({
                        ...question,
                        orderIndex: index,
                    }));
                const normalizedStructure = normalizeExamStructure(
                    reorderedQuestions,
                    state.questionSections,
                );

                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.isDirty = true;
            });
        },
    })),
);
