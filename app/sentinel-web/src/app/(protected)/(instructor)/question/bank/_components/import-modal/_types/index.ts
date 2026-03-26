export type ImportTab = 'upload' | 'ai';

export interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
