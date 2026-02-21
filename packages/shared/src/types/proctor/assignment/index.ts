import { ProctorExam } from '..';

export interface ProctorAssignmentExam extends ProctorExam {
    assignedProctor: string;
    assignedProctorId: string;
}
