import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { type QuestionType, type ExamQuestion } from '@sentinel/shared/types';
import { type QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';
import { type UseExamBuilderResult } from './_types';

export function useExamBuilder(): UseExamBuilderResult {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const titleParam = searchParams.get('title') || 'Untitled Exam';

    const {
        title,
        description,
        questions,
        status,
        loadExam,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        saveExam,
        publishExam,
    } = useExamStore();

    useEffect(() => {
        if (id) {
            loadExam(id);
        }
    }, [id, loadExam]);

    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);

    const handleSelectQuestionType = (type: QuestionType) => {
        setEditingQuestion(null);
        setIsTypeSelectorOpen(false);
        setActiveQuestionType(type);
    };

    const handleCreateQuestion = (payload: QuestionBuilderPayload) => {
        const newQuestion: ExamQuestion = {
            id: crypto.randomUUID(),
            examId: crypto.randomUUID(),
            type: payload.type,
            content: payload.content,
            points: payload.points,
            orderIndex: questions.length,
        };
        addQuestion(newQuestion);
        setActiveQuestionType(null);
        toast.success('Question created!');
    };

    const handleDuplicateQuestion = (payload: QuestionBuilderPayload) => {
        const newQuestion: ExamQuestion = {
            id: crypto.randomUUID(),
            examId: crypto.randomUUID(),
            type: payload.type,
            content: payload.content,
            points: payload.points,
            orderIndex: questions.length,
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

    const handleUpdateQuestion = (questionId: string, payload: QuestionBuilderPayload) => {
        updateQuestion(questionId, {
            type: payload.type,
            content: payload.content,
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

    const handleImportQuestions = (newQuestions: ExamQuestion[]) => {
        newQuestions.forEach((q) => {
            addQuestion({
                ...q,
                id: crypto.randomUUID(),
                examId: id,
                orderIndex: questions.length,
            });
        });
        toast.success(`${newQuestions.length} questions imported from bank!`);
    };

    const handleBackFromBuilder = () => {
        setActiveQuestionType(null);
        setEditingQuestion(null);
    };

    const handleSave = () => {
        saveExam();
        router.push('/exams');
    };

    const handlePublish = () => {
        publishExam();
        router.push('/exams');
    };

    return {
        title,
        description,
        status,
        questions,
        titleParam,
        isTypeSelectorOpen,
        activeQuestionType,
        editingQuestion,
        setIsTypeSelectorOpen,
        handleSelectQuestionType,
        handleCreateQuestion,
        handleDuplicateQuestion,
        handleEditQuestion,
        handleUpdateQuestion,
        handleDeleteQuestion,
        handleImportQuestions,
        handleBackFromBuilder,
        handleSave,
        handlePublish,
    };
}
