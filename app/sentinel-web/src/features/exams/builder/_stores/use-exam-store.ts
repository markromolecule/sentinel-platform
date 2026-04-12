import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { SaveBuilderWorkspacePayload } from '@sentinel/services';
import type { ExamQuestion, ExamQuestionSection, ExamSettings, ProctorExam } from '@sentinel/shared/types';

export type ExamStatus = 'draft' | 'published';

const DEFAULT_EXAM_SETTINGS: ExamSettings = {
    shuffleQuestions: true,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: true,
};

const DEFAULT_SECTION_TITLE = 'Section 1';

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const generateSectionId = () => crypto.randomUUID();

const createQuestionSection = (index: number, title = `Section ${index + 1}`): ExamQuestionSection => ({
    id: generateSectionId(),
    title,
    orderIndex: index,
    isCollapsed: false,
});

const getEndDateTime = (startDateTime?: string, durationMinutes?: number, fallbackEndDateTime?: string) => {
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
    subjectId: string | null;
    subject: string;
    section: string;
    startDateTime: string | null;
    endDateTime: string | null;
    durationMinutes: number;
    passingScore: number;
    settings: ExamSettings;
    questionSections: ExamQuestionSection[];
    questions: ExamQuestion[];
    status: ExamStatus;
}

export interface ExamStoreActions {
    hydrateExam: (exam: ProctorExam) => void;
    setSetupDraft: (setup: {
        examId: string;
        title: string;
        description: string;
        subjectId: string;
        subject: string;
        section: string;
        startDateTime: string;
        endDateTime: string;
        durationMinutes: number;
        passingScore: number;
        settings: ExamSettings;
    }) => void;
    setExamId: (id: string) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    updateSetting: <K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) => void;
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
        subjectId: null,
        subject: 'General Subject',
        section: '',
        startDateTime: null,
        endDateTime: null,
        durationMinutes: 60,
        passingScore: 75,
        settings: { ...DEFAULT_EXAM_SETTINGS },
        questionSections: [createQuestionSection(0, DEFAULT_SECTION_TITLE)],
        questions: [],
        status: 'draft',
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
            ...(question.sourcePageNumber
                ? { sourcePageNumber: question.sourcePageNumber }
                : {}),
            ...(question.sourceEvidence ? { sourceEvidence: question.sourceEvidence } : {}),
            type: question.type,
            points: question.points,
            orderIndex: index,
            content: question.content,
        }));

    return {
        title: state.title,
        description: state.description,
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
                state.examId = exam.id;
                state.title = exam.title;
                state.description = exam.description || '';
                state.subjectId = exam.subjectId || null;
                state.subject = exam.subject || 'General Subject';
                state.section = exam.section || '';
                state.startDateTime = exam.scheduledDate || null;
                state.endDateTime = getEndDateTime(exam.scheduledDate, exam.duration, exam.endDateTime);
                state.durationMinutes = exam.duration || 60;
                state.passingScore = exam.passingScore || 75;
                state.settings = exam.settings || { ...DEFAULT_EXAM_SETTINGS };
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
                state.status = exam.status === 'published' ? 'published' : 'draft';
            });
        },

        setSetupDraft: (setup) => {
            set((state) => {
                state.examId = setup.examId;
                state.title = setup.title;
                state.description = setup.description;
                state.subjectId = setup.subjectId;
                state.subject = setup.subject;
                state.section = setup.section;
                state.startDateTime = setup.startDateTime;
                state.endDateTime = setup.endDateTime;
                state.durationMinutes = setup.durationMinutes;
                state.passingScore = setup.passingScore;
                state.settings = { ...setup.settings };
                state.questionSections = [createQuestionSection(0, DEFAULT_SECTION_TITLE)];
                state.questions = [];
                state.status = 'draft';
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
            });
        },

        setDescription: (description) => {
            set((state) => {
                state.description = description;
            });
        },

        updateSetting: (key, value) => {
            set((state) => {
                state.settings[key] = value;
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
            });
        },

        updateQuestionSection: (sectionId, updates) => {
            set((state) => {
                const sectionIndex = state.questionSections.findIndex((section) => section.id === sectionId);
                if (sectionIndex !== -1) {
                    Object.assign(state.questionSections[sectionIndex], updates);
                }
            });
        },

        deleteQuestionSection: (sectionId) => {
            set((state) => {
                if (state.questionSections.length <= 1) {
                    return;
                }

                const remainingSections = state.questionSections.filter((section) => section.id !== sectionId);
                const remainingQuestions = state.questions.filter((question) => question.sectionId !== sectionId);
                const normalizedStructure = normalizeExamStructure(remainingQuestions, remainingSections);

                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
            });
        },

        toggleQuestionSectionCollapse: (sectionId) => {
            set((state) => {
                const sectionIndex = state.questionSections.findIndex((section) => section.id === sectionId);
                if (sectionIndex !== -1) {
                    state.questionSections[sectionIndex].isCollapsed = !state.questionSections[sectionIndex].isCollapsed;
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

                const normalizedStructure = normalizeExamStructure(state.questions, sectionsWithUpdatedOrder);
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
            });
        },

        setQuestions: (questions) => {
            set((state) => {
                const normalizedStructure = normalizeExamStructure(questions, state.questionSections);
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
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
            });
        },

        updateQuestion: (id, updates) => {
            set((state) => {
                const index = state.questions.findIndex((q) => q.id === id);
                if (index !== -1) {
                    Object.assign(state.questions[index], updates);
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
                const normalizedStructure = normalizeExamStructure(questionsWithUpdatedOrder, state.questionSections);
                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
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
                const normalizedStructure = normalizeExamStructure(reorderedQuestions, state.questionSections);

                state.questionSections = normalizedStructure.questionSections;
                state.questions = normalizedStructure.questions;
            });
        },
    }))
);
