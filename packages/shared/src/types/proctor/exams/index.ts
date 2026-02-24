import { ProctorExam, ExamQuestion, ExamQuestionContent } from '../..';

export type ExamsPageHeaderProps = {
    onCreateClick: () => void;
};

export type ExamsFilterBarProps = {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    activeTab: string;
    onTabChange: (value: string) => void;
};

export type ExamsGridProps = {
    exams: ProctorExam[];
};

export type ExamCardProps = {
    exam: ProctorExam;
};

export type ExamEmptyStateProps = {
    isSearching: boolean;
    onCreateClick: () => void;
};

export type ExamCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export type ExamCreateFormProps = {
    onClose: () => void;
};

export type ExamAssignDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examTitle: string;
};

export type ExamActionCellProps = {
    exam: ProctorExam;
};

export type QuestionCardProps = {
    question: ExamQuestion;
    isActive: boolean;
    onActivate: () => void;
};

export type QuestionFormProps = {
    content: ExamQuestionContent;
    onChange: (updates: Partial<ExamQuestionContent>) => void;
};
