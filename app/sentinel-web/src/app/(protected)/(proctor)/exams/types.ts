export type ExamStatus =
    | 'available'
    | 'completed'
    | 'in-progress'
    | 'upcoming'
    | 'draft'
    | 'scheduled'
    | 'active'
    | 'published'
    | 'archived';

export type QuestionType =
    | 'multiple_choice'
    | 'multiple_response'
    | 'true_false'
    | 'identification'
    | 'matching'
    | 'essay'
    | 'fill_blank'
    | 'enumeration';

export type ExamSettings = {
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    randomizeChoices: boolean;
};

export type MatchingPair = {
    left: string;
    right: string;
};

export type ExamQuestion = {
    id: string;
    type: QuestionType;
    prompt: string;
    points: number;
    options?: string[];
    correctOption?: number | null;
    acceptedAnswers?: string[];
    rubric?: string;
    maxLength?: number;
    correctBoolean?: boolean;
    pairs?: MatchingPair[];
    blanks?: string[];
};

export type ExamShareSettings = {
    visibility: 'public' | 'private' | 'password';
    password?: string;
    link: string;
    embedCode: string;
};

export type ExamAssignment = {
    studentIds: string[];
    groupIds: string[];
    dueDate: string;
    dueTime: string;
    instructions: string;
    notify: boolean;
};

export type Exam = {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    status: ExamStatus;
    settings: ExamSettings;
    questions: ExamQuestion[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    share: ExamShareSettings;
    assignment: ExamAssignment;
    subject: string;
    duration: number;
    studentsCount: number;
    questionCount: number;
    scheduledDate?: string;
};

export type ExamSetupDraft = {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    settings: ExamSettings;
};

export type Student = {
    id: string;
    name: string;
    email: string;
};

export type Group = {
    id: string;
    name: string;
    memberCount: number;
};

export type QuestionTypeOption = {
    value: QuestionType;
    label: string;
    description: string;
};
