export type ExamAssignmentStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'SCHEDULED';

export type ExamAssignmentRelationship = 'INBOUND' | 'OUTBOUND';

export type ExamAssignmentActorRecord = {
    id: string;
    name: string;
};

export type ExamAssignmentExamRecord = {
    id: string;
    title: string;
    subjectTitle: string | null;
    scheduledDate: string | Date | null;
    endDateTime: string | Date | null;
};

export type ExamAssignmentRecord = {
    id: string;
    relationship: ExamAssignmentRelationship;
    exam: ExamAssignmentExamRecord;
    assigner: ExamAssignmentActorRecord;
    assignee: ExamAssignmentActorRecord;
    status: ExamAssignmentStatus;
    scheduledAt: string | Date | null;
    createdAt: string | Date | null;
    updatedAt: string | Date | null;
};
