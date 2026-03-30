import { type Subject } from '@sentinel/shared/types';
import { SectionOption } from '@/app/(protected)/(instructor)/subjects/_hooks/use-unenrollment';

export interface UnenrollSubjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject;
    allSections: SectionOption[];
    selectedSectionIds: string[];
    onToggleSection: (id: string) => void;
    onToggleAll: () => void;
    onUnenroll: () => void;
    isPending: boolean;
}
