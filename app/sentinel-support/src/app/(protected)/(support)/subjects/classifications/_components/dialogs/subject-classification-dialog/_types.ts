import { SubjectClassification } from '@sentinel/shared/types';

export type SubjectClassificationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classification: SubjectClassification | null;
};
