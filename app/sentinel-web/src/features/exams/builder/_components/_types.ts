import type { ExamQuestion, ExamQuestionContent, QuestionType } from '@sentinel/shared/types';

export interface QuestionBucketTableProps {
    questions: ExamQuestion[];
    onEdit: (questionId: string) => void;
    onDelete: (questionId: string) => void;
    onAdd: () => void;
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
