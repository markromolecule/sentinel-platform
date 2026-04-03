export type ViewMode = 'grid' | 'list';

export interface Collection {
    id: string;
    name: string;
    description?: string;
    lastUpdated: string;
    questionIds: string[];
    isPublic: boolean;
}
