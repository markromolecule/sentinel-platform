export type ViewMode = 'grid' | 'list';

export interface Collection {
    id: string;
    name: string;
    description?: string | null;
    lastUpdated: string;
    questionCount: number;
    isPublic: boolean;
    author?: string | null;
}
