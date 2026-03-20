import { ProctorExam } from '..';

export interface InstructorAssignmentExam extends ProctorExam {
    assignedInstructor: string;
    assignedInstructorId: string;
}
