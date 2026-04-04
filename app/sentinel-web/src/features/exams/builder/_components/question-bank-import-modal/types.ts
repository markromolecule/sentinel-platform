import type {
    QuestionBankCollectionRecord,
    QuestionRecord,
} from '@sentinel/services';
import type { ExamQuestion } from '@sentinel/shared/types';

export interface QuestionBankImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (questions: ExamQuestion[]) => void;
}

export interface QuestionBankImportModalState {
    questionRecords: QuestionRecord[];
    collections: QuestionBankCollectionRecord[];
    selectedCollection: QuestionBankCollectionRecord | null;
    selectedCollectionId: string;
    selectedIds: string[];
    searchQuery: string;
    totalQuestionCount: number;
    hasMoreQuestions: boolean;
    isFetchingMoreQuestions: boolean;
    isQuestionsLoading: boolean;
    isCollectionsLoading: boolean;
    isSelectedCollectionLoading: boolean;
    setSearchQuery: (value: string) => void;
    setSelectedCollectionId: (value: string) => void;
    toggleQuestion: (id: string) => void;
    toggleSelectAllFilteredQuestions: () => void;
    fetchNextQuestionsPage: () => Promise<unknown>;
    buildImportedQuestions: () => ExamQuestion[];
    resetState: () => void;
}
