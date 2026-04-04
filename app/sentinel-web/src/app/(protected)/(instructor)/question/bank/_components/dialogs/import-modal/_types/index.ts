import type { QuestionType } from '@sentinel/shared/types';

export type ImportTab = 'upload' | 'ai';
export type ImportStep = 'upload' | 'configure';

export type QuestionTypeDistributionItem = {
    type: QuestionType;
    count: number;
};

export interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId?: string;
    collectionName?: string;
}
