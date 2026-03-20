import { InstructorAssignment } from '../../../index';

export type { InstructorAssignment };

export interface AssignInstructorFormData {
    instructorId: string;
    examId: string;
    // For simplicity, we might just assume assigning to an exam assigns to all students or select students later
    // The previous table didn't show specific student assignment in the row, just a count.

    // We will stick to assigning an instructor to an exam for now.
}

export interface AssignInstructorDialogProps {
    assignment?: InstructorAssignment | null; // If null, creating new
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
