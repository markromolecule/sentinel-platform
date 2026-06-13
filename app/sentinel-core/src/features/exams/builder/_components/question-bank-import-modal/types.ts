import type {
    QuestionBankCollectionRecord,
    QuestionRecord,
    QuestionTypeDefinition,
} from '@sentinel/services';
import type { ExamQuestion, QuestionType } from '@sentinel/shared/types';

export interface QuestionBankImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (questions: ExamQuestion[]) => void;
    existingQuestions?: ExamQuestion[];
}

export interface QuestionBankImportModalState {
    questionRecords: QuestionRecord[];
    collections: QuestionBankCollectionRecord[];
    questionTypes: QuestionTypeDefinition[];
    selectedCollection: QuestionBankCollectionRecord | null;
    selectedCollectionId: string;
    selectedIds: string[];
    selectedIdSet: Set<string>;
    alreadyAddedIds: string[];
    alreadyAddedIdSet: Set<string>;
    searchQuery: string;
    selectedQuestionType: QuestionType | 'all';
    selectedImportableCount: number;
    totalQuestionCount: number;
    hasMoreQuestions: boolean;
    isFetchingMoreQuestions: boolean;
    isQuestionsLoading: boolean;
    isCollectionsLoading: boolean;
    isQuestionTypesLoading: boolean;
    isSelectedCollectionLoading: boolean;
    setSearchQuery: (value: string) => void;
    setSelectedCollectionId: (value: string) => void;
    setSelectedQuestionType: (value: QuestionType | 'all') => void;
    toggleQuestion: (id: string) => void;
    toggleSelectAllFilteredQuestions: () => void;
    fetchNextQuestionsPage: () => Promise<unknown>;
    buildImportedQuestions: () => ExamQuestion[];
    resetState: (options?: { preserveAlreadyAddedIds?: string[] }) => void;
}
