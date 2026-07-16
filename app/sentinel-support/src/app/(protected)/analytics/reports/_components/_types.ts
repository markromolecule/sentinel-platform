import type { Institution } from '@sentinel/shared/types';
import { ReportPreset } from '../_types';

export interface QueueReportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onTitleChange: (value: string) => void;
    selectedInstitutionId: string;
    onInstitutionChange: (value: string) => void;
    preset: ReportPreset;
    onPresetChange: (value: ReportPreset) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
    validationErrors: string[];
    availableInstitutions: Institution[];
    isInstitutionLocked: boolean;
    scopedInstitutionId?: string | null;
    onSubmit: () => Promise<void> | void;
    isPending: boolean;
}
