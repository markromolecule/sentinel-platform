import type { ExamQuestion, QuestionType } from '../types';

export interface QuestionBucketTableProps {
    questions: ExamQuestion[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onAdd: () => void;
}

export interface QuestionBuilderFormProps {
    type: QuestionType;
    onBack: () => void;
    onCreate: (question: ExamQuestion) => void;
    onDuplicate: (question: ExamQuestion) => void;
}

export interface QuestionTypeSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (type: QuestionType) => void;
}
