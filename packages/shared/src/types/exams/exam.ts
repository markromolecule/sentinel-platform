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
    | 'MULTIPLE_CHOICE'
    | 'MULTIPLE_RESPONSE'
    | 'TRUE_FALSE'
    | 'IDENTIFICATION'
    | 'MATCHING'
    | 'ESSAY'
    | 'FILL_BLANK'
    | 'ENUMERATION';

export type QuestionDifficulty = 'EASY' | 'MODERATE' | 'HARD';

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

export type ExamQuestionContent = {
    prompt: string;
    options?: string[];
    correctAnswer?: string | number | boolean | string[] | number[];
    acceptedAnswers?: string[];
    rubric?: string;
    maxLength?: number;
    correctBoolean?: boolean;
    pairs?: MatchingPair[];
    blanks?: string[];
    caseSensitive?: boolean;
};

export type ExamQuestionSection = {
    id: string;
    title: string;
    orderIndex: number;
    isCollapsed?: boolean;
};

export type ExamQuestion = {
    id: string;
    examId: string;
    sourceQuestionBankQuestionId?: string;
    sourceCollectionId?: string;
    type: QuestionType;
    difficulty?: QuestionDifficulty;
    points: number;
    orderIndex: number;
    sectionId?: string;
    tags: string[];
    content: ExamQuestionContent;
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
    duration: number; // in minutes
    passingScore: number;
    status: ExamStatus;
    settings?: ExamSettings;
    questions?: ExamQuestion[];
    questionSections?: ExamQuestionSection[];
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    share?: ExamShareSettings;
    assignment?: ExamAssignment;
    subject: string;
    subjectId?: string;
    section?: string;
    room?: string;
    roomId?: string;
    studentsCount?: number;
    questionCount?: number;
    scheduledDate?: string;
    endDateTime?: string;
    // Legacy support (optional)
    difficulty?: 'easy' | 'medium' | 'hard';
    professor?: string;
};

export type ExamSetupDraft = {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    settings: ExamSettings;
};

export type QuestionTypeOption = {
    value: QuestionType;
    label: string;
    description: string;
};
