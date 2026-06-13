import { GenerateQuestionPreviewResponse } from '@sentinel/shared';

export type PreviewQuestion = GenerateQuestionPreviewResponse['questions'][number];

export interface PreviewSelection {
    selectedIds: Set<number>;
    totalCount: number;
    selectedCount: number;
}
