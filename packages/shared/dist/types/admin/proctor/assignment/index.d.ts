import { ProctorAssignment } from '../../../index';
export type { ProctorAssignment };
export interface AssignProctorFormData {
    proctorId: string;
    examId: string;
}
export interface AssignProctorDialogProps {
    assignment?: ProctorAssignment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
//# sourceMappingURL=index.d.ts.map