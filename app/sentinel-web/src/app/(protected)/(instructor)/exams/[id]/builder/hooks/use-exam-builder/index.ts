import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
    useBuilderWorkspaceQuery,
    useCreateQuestionMutation,
    usePublishBuilderWorkspaceMutation,
    useSaveBuilderWorkspaceMutation,
    useUpdateExamMutation,
    useValidateQuestionTypeContentMutation,
} from '@sentinel/hooks';
import { toast } from 'sonner';
import {
    type QuestionType,
    type ExamQuestion,
    type ExamQuestionSection,
} from '@sentinel/shared/types';
import { type QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';
import {
    buildBuilderWorkspacePayload,
    useExamStore,
} from '@/features/exams/builder/_stores/use-exam-store';
import { type UseExamBuilderResult } from '@/app/(protected)/(instructor)/exams/[id]/builder/hooks/use-exam-builder/_types';
import { BUILDER_QUERY_KEYS } from '@sentinel/shared/constants';

export function useExamBuilder(): UseExamBuilderResult {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const queryClient = useQueryClient();
    const titleParam = searchParams.get('title') || 'Untitled Exam';
    const { data: builderWorkspace, isLoading: isWorkspaceLoading } = useBuilderWorkspaceQuery(id);
    const validateQuestionTypeContentMutation = useValidateQuestionTypeContentMutation();
    const createQuestionMutation = useCreateQuestionMutation();
    const saveBuilderWorkspaceMutation = useSaveBuilderWorkspaceMutation();
    const publishBuilderWorkspaceMutation = usePublishBuilderWorkspaceMutation();
    const updateExamMutation = useUpdateExamMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: BUILDER_QUERY_KEYS.workspace(id),
            });
        },
    });

    const {
        title,
        description,
        subjectId,
        subject,
        section,
        startDateTime,
        endDateTime,
        durationMinutes,
        passingScore,
        settings,
        questionSections,
        questions,
        status,
        hydrateExam,
        setTitle,
        updateSetting,
        addQuestionSection,
        updateQuestionSection,
        deleteQuestionSection,
        toggleQuestionSectionCollapse,
        reorderQuestionSections,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestionsInSection,
    } = useExamStore();

    useEffect(() => {
        if (builderWorkspace?.exam) {
            hydrateExam(builderWorkspace.exam);
        }
    }, [builderWorkspace?.exam, hydrateExam]);

    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
    const questionTypes = builderWorkspace?.questionTypes ?? [];
    const isQuestionTypesLoading = isWorkspaceLoading;
    const activeQuestionTypeDefinition = questionTypes.find(
        (questionType) => questionType.value === activeQuestionType,
    );

    const handleSelectQuestionType = (type: QuestionType) => {
        setEditingQuestion(null);
        setIsTypeSelectorOpen(false);
        setActiveQuestionType(type);
    };

    const resolveTargetSectionId = (sectionId?: string) =>
        sectionId || questionSections.at(-1)?.id || questionSections[0]?.id;

    const handleCreateQuestion = async (payload: QuestionBuilderPayload, sectionId?: string) => {
        const targetSectionId = resolveTargetSectionId(sectionId);
        const validationResult = await validateQuestionTypeContentMutation.mutateAsync({
            type: payload.type,
            content: payload.content,
        });

        const newQuestion: ExamQuestion = {
            id: crypto.randomUUID(),
            examId: id,
            type: payload.type,
            difficulty: payload.difficulty,
            content: validationResult.content,
            points: payload.points,
            orderIndex: questions.length,
            sectionId: targetSectionId,
        };
        addQuestion(newQuestion);
        setActiveQuestionType(null);
        toast.success('Question created!');
    };

    const handleDuplicateQuestion = async (payload: QuestionBuilderPayload, sectionId?: string) => {
        const targetSectionId = resolveTargetSectionId(sectionId);
        const validationResult = await validateQuestionTypeContentMutation.mutateAsync({
            type: payload.type,
            content: payload.content,
        });

        const newQuestion: ExamQuestion = {
            id: crypto.randomUUID(),
            examId: id,
            type: payload.type,
            difficulty: payload.difficulty,
            content: validationResult.content,
            points: payload.points,
            orderIndex: questions.length,
            sectionId: targetSectionId,
        };
        addQuestion(newQuestion);
        toast.success('Question duplicated!');
    };

    const handleEditQuestion = (questionId: string) => {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
            setEditingQuestion(question);
            setActiveQuestionType(question.type);
        }
    };

    const handleUpdateQuestion = async (questionId: string, payload: QuestionBuilderPayload) => {
        const validationResult = await validateQuestionTypeContentMutation.mutateAsync({
            type: payload.type,
            content: payload.content,
        });

        updateQuestion(questionId, {
            type: payload.type,
            difficulty: payload.difficulty,
            content: validationResult.content,
            points: payload.points,
        });
        setActiveQuestionType(null);
        setEditingQuestion(null);
        toast.success('Question updated!');
    };

    const handleDeleteQuestion = (questionId: string) => {
        deleteQuestion(questionId);
        toast.success('Question deleted!');
    };

    const handleAddQuestionToBank = async (questionId: string) => {
        const question = useExamStore.getState().questions.find((item) => item.id === questionId);

        if (!question) {
            toast.error('Question not found.');
            return;
        }

        if (question.sourceQuestionBankQuestionId) {
            toast.info('This question is already linked to the question bank.');
            return;
        }

        const createdQuestion = await createQuestionMutation.mutateAsync({
            type: question.type,
            difficulty: question.difficulty,
            points: question.points,
            content: question.content,
            subjectId: subjectId ?? undefined,
        });

        updateQuestion(questionId, {
            sourceQuestionBankQuestionId: createdQuestion.id,
            sourceCollectionId: undefined,
        });
    };

    const handleAddQuestionSection = () => {
        addQuestionSection();
    };

    const handleUpdateQuestionSection = (
        sectionId: string,
        updates: Partial<ExamQuestionSection>,
    ) => {
        updateQuestionSection(sectionId, updates);
    };

    const handleDeleteQuestionSection = (sectionId: string) => {
        const section = questionSections.find((item) => item.id === sectionId);
        const sectionQuestionCount = questions.filter(
            (question) => question.sectionId === sectionId,
        ).length;

        if (questionSections.length <= 1) {
            toast.error('At least one section is required.');
            return;
        }

        deleteQuestionSection(sectionId);
        toast.success(
            sectionQuestionCount > 0
                ? `${section?.title || 'Section'} and its questions were deleted.`
                : `${section?.title || 'Section'} deleted.`,
        );
    };

    const handleToggleQuestionSectionCollapse = (sectionId: string) => {
        toggleQuestionSectionCollapse(sectionId);
    };

    const handleReorderQuestionSections = (startIndex: number, endIndex: number) => {
        reorderQuestionSections(startIndex, endIndex);
    };

    const handleReorderQuestionsInSection = (
        sectionId: string,
        startIndex: number,
        endIndex: number,
    ) => {
        reorderQuestionsInSection(sectionId, startIndex, endIndex);
    };

    const handleImportQuestions = (newQuestions: ExamQuestion[], sectionId?: string) => {
        const targetSectionId = resolveTargetSectionId(sectionId);

        newQuestions.forEach((q, index) => {
            addQuestion({
                ...q,
                id: crypto.randomUUID(),
                examId: id,
                orderIndex: questions.length + index,
                sectionId: targetSectionId,
            });
        });
        toast.success(`${newQuestions.length} questions imported from bank!`);
    };

    const handleBackFromBuilder = () => {
        setActiveQuestionType(null);
        setEditingQuestion(null);
    };

    const handleToggleExamSetting = (key: keyof typeof settings, value: boolean) => {
        updateSetting(key, value);
    };

    const handleUpdateTitle = async (nextTitle: string) => {
        const examId = useExamStore.getState().examId ?? id;
        const trimmedTitle = nextTitle.trim();
        const currentTitle = useExamStore.getState().title;

        if (!examId) {
            toast.error('Exam not found.');
            return false;
        }

        if (!trimmedTitle) {
            toast.error('Exam title is required.');
            return false;
        }

        if (trimmedTitle.length < 4 || trimmedTitle.length > 100) {
            toast.error('Exam title must be between 4 and 100 characters.');
            return false;
        }

        if (trimmedTitle === currentTitle) {
            return true;
        }

        setTitle(trimmedTitle);

        try {
            await updateExamMutation.mutateAsync({
                id: examId,
                payload: {
                    title: trimmedTitle,
                },
            });
            return true;
        } catch {
            setTitle(currentTitle);
            return false;
        }
    };

    const handleSave = async () => {
        const examId = useExamStore.getState().examId ?? id;

        if (!examId) {
            toast.error('Exam not found.');
            return;
        }

        await saveBuilderWorkspaceMutation.mutateAsync({
            id: examId,
            payload: buildBuilderWorkspacePayload(useExamStore.getState()),
        });
        router.push('/exams');
    };

    const handlePublish = async () => {
        const examId = useExamStore.getState().examId ?? id;

        if (!examId) {
            toast.error('Exam not found.');
            return;
        }

        await publishBuilderWorkspaceMutation.mutateAsync(examId);
        router.push('/exams');
    };

    return {
        title,
        description,
        subject,
        section,
        startDateTime,
        endDateTime,
        durationMinutes,
        passingScore,
        settings,
        status,
        questionSections,
        questions,
        questionTypes,
        isWorkspaceLoading,
        isSaving: saveBuilderWorkspaceMutation.isPending,
        isPublishing: publishBuilderWorkspaceMutation.isPending,
        isQuestionTypesLoading,
        isUpdatingTitle: updateExamMutation.isPending,
        isAddingQuestionToBank: createQuestionMutation.isPending,
        titleParam,
        isTypeSelectorOpen,
        activeQuestionType,
        activeQuestionTypeDefinition,
        editingQuestion,
        setIsTypeSelectorOpen,
        handleSelectQuestionType,
        handleCreateQuestion,
        handleDuplicateQuestion,
        handleEditQuestion,
        handleUpdateQuestion,
        handleDeleteQuestion,
        handleAddQuestionToBank,
        handleAddQuestionSection,
        handleUpdateQuestionSection,
        handleDeleteQuestionSection,
        handleToggleQuestionSectionCollapse,
        handleReorderQuestionSections,
        handleReorderQuestionsInSection,
        handleImportQuestions,
        handleToggleExamSetting,
        handleUpdateTitle,
        handleBackFromBuilder,
        handleSave,
        handlePublish,
    };
}
