import { toast } from 'sonner';
import { type ExamQuestion, type ExamQuestionSection } from '@sentinel/shared/types';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';

interface UseSectionManagementProps {
    questionSections: ExamQuestionSection[];
    questions: ExamQuestion[];
}

export function useSectionManagement({ questionSections, questions }: UseSectionManagementProps) {
    const {
        addQuestionSection,
        updateQuestionSection,
        deleteQuestionSection,
        toggleQuestionSectionCollapse,
        reorderQuestionSections,
        reorderQuestionsInSection,
    } = useExamStore();

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

    return {
        handleAddQuestionSection,
        handleUpdateQuestionSection,
        handleDeleteQuestionSection,
        handleToggleQuestionSectionCollapse,
        handleReorderQuestionSections,
        handleReorderQuestionsInSection,
    };
}
