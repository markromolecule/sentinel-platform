import type {
    ExamQuestion,
    ExamQuestionContent,
    ExamQuestionSection,
    QuestionType,
} from '@sentinel/shared/types';

export interface QuestionBucketTableProps {
    sections?: ExamQuestionSection[];
    questions: ExamQuestion[];
    onEdit: (questionId: string) => void;
    onDelete: (questionId: string) => void;
    onReorder?: (startIndex: number, endIndex: number) => void;
    onReorderInSection?: (sectionId: string, startIndex: number, endIndex: number) => void;
    onReorderSections?: (startIndex: number, endIndex: number) => void;
    onAdd: (sectionId?: string) => void;
    onAddSection?: () => void;
    onImport: (sectionId?: string) => void;
    onUpdateSection?: (sectionId: string, updates: Partial<ExamQuestionSection>) => void;
    onDeleteSection?: (sectionId: string) => void;
    onToggleSectionCollapse?: (sectionId: string) => void;
}

export interface QuestionBuilderFormProps {
    type: QuestionType;
    initialData?: ExamQuestion;
    onBack: () => void;
    onCreate: (question: QuestionBuilderPayload) => void;
    onUpdate?: (id: string, question: QuestionBuilderPayload) => void;
    onDuplicate: (question: QuestionBuilderPayload) => void;
}

export interface QuestionTypeSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (type: QuestionType) => void;
}

export type QuestionBuilderPayload = {
    type: QuestionType;
    content: ExamQuestionContent;
    points: number;
};
