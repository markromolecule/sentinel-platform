import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import {
    useBuilderWorkspaceQuery,
    usePublishBuilderWorkspaceMutation,
    useSaveBuilderWorkspaceMutation,
    useValidateQuestionTypeContentMutation,
} from '@sentinel/hooks';
import { toast } from 'sonner';
import { type QuestionType, type ExamQuestion, type ExamQuestionSection } from '@sentinel/shared/types';
import { type QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';
import {
    buildBuilderWorkspacePayload,
    useExamStore,
} from '@/features/exams/builder/_stores/use-exam-store';
import { type UseExamBuilderResult } from '@/app/(protected)/(instructor)/exams/[id]/builder/hooks/use-exam-builder/_types';

export function useExamBuilder(): UseExamBuilderResult {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const titleParam = searchParams.get('title') || 'Untitled Exam';
    const {
        data: builderWorkspace,
        isLoading: isWorkspaceLoading,
    } = useBuilderWorkspaceQuery(id);
    const validateQuestionTypeContentMutation = useValidateQuestionTypeContentMutation();
    const saveBuilderWorkspaceMutation = useSaveBuilderWorkspaceMutation();
    const publishBuilderWorkspaceMutation = usePublishBuilderWorkspaceMutation();

    const {
        title,
        description,
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

    const handleAddQuestionSection = () => {
        addQuestionSection();
    };

    const handleUpdateQuestionSection = (sectionId: string, updates: Partial<ExamQuestionSection>) => {
        updateQuestionSection(sectionId, updates);
    };

    const handleDeleteQuestionSection = (sectionId: string) => {
        const section = questionSections.find((item) => item.id === sectionId);
        const sectionQuestionCount = questions.filter((question) => question.sectionId === sectionId).length;

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

    const handleReorderQuestionsInSection = (sectionId: string, startIndex: number, endIndex: number) => {
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
        handleAddQuestionSection,
        handleUpdateQuestionSection,
        handleDeleteQuestionSection,
        handleToggleQuestionSectionCollapse,
        handleReorderQuestionSections,
        handleReorderQuestionsInSection,
        handleImportQuestions,
        handleToggleExamSetting,
        handleBackFromBuilder,
        handleSave,
        handlePublish,
    };
}
