export type ViewMode = 'grid' | 'list';

export interface Collection {
    id: string;
    name: string;
    description?: string | null;
    lastUpdated: string;
    questionCount: number;
    isPublic: boolean;
    createdById?: string | null;
    updatedById?: string | null;
}
