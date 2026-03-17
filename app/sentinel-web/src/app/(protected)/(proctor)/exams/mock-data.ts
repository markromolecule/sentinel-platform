import type {
    Exam,
    ExamAssignment,
    ExamSettings,
    ExamShareSettings,
    QuestionTypeOption,
    Group,
    Student,
} from "./types";

export const questionTypeOptions: QuestionTypeOption[] = [
    {
        value: "multiple_choice",
        label: "Multiple Choice",
        description: "Single best answer with distractors.",
    },
    {
        value: "identification",
        label: "Identification",
        description: "Short answer with accepted responses.",
    },
    {
        value: "essay",
        label: "Essay",
        description: "Long-form response with rubric guidance.",
    },
    {
        value: "true_false",
        label: "True / False",
        description: "Binary choice with instant evaluation.",
    },
    {
        value: "matching",
        label: "Matching",
        description: "Pair concepts and definitions.",
    },
    {
        value: "fill_blank",
        label: "Fill in the Blank",
        description: "Sentence completion with key terms.",
    },
];

export const defaultExamSettings: ExamSettings = {
    shuffleQuestions: true,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: true,
};

export const defaultAssignment: ExamAssignment = {
    studentIds: [],
    groupIds: [],
    dueDate: "",
    dueTime: "",
    instructions: "",
    notify: true,
};

export const defaultShareSettings: ExamShareSettings = {
    visibility: "private",
    password: "",
    link: "",
    embedCode: "",
};

export const mockStudents: Student[] = [
    {
        id: "stu-001",
        name: "Ariana Chen",
        email: "ariana.chen@sentinel.edu",
    },
    {
        id: "stu-002",
        name: "Diego Alvarez",
        email: "diego.alvarez@sentinel.edu",
    },
    {
        id: "stu-003",
        name: "Priya Nair",
        email: "priya.nair@sentinel.edu",
    },
    {
        id: "stu-004",
        name: "Marcus Hill",
        email: "marcus.hill@sentinel.edu",
    },
    {
        id: "stu-005",
        name: "Fatima Noor",
        email: "fatima.noor@sentinel.edu",
    },
];

export const mockGroups: Group[] = [
    {
        id: "grp-101",
        name: "CS301 - Morning Section",
        memberCount: 24,
    },
    {
        id: "grp-102",
        name: "CS301 - Evening Section",
        memberCount: 21,
    },
    {
        id: "grp-201",
        name: "IT205 - Honors",
        memberCount: 18,
    },
];

export const mockExams: Exam[] = [
    {
        id: "exam-draft-001",
        title: "Data Structures Midterm",
        description: "Covers stacks, queues, trees, and graph traversal.",
        timeLimit: 90,
        passingScore: 70,
        status: "Draft",
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        },
        questions: [
            {
                id: "q-001",
                type: "multiple_choice",
                prompt: "Which data structure uses FIFO ordering?",
                points: 2,
                options: ["Stack", "Queue", "Tree", "Graph"],
                correctOption: 1,
            },
            {
                id: "q-002",
                type: "true_false",
                prompt: "A binary tree can have more than two children per node.",
                points: 1,
                correctBoolean: false,
            },
            {
                id: "q-003",
                type: "identification",
                prompt: "Name the algorithm that visits nodes level by level.",
                points: 2,
                acceptedAnswers: ["Breadth-first search", "BFS"],
            },
        ],
        createdAt: "2026-03-10T08:30:00.000Z",
        updatedAt: "2026-03-15T11:15:00.000Z",
        share: {
            visibility: "private",
            password: "",
            link: "https://sentinel.app/exams/exam-draft-001",
            embedCode: "<iframe src=\"https://sentinel.app/exams/exam-draft-001\"></iframe>",
        },
        assignment: {
            studentIds: ["stu-001", "stu-003"],
            groupIds: ["grp-101"],
            dueDate: "",
            dueTime: "",
            instructions: "",
            notify: true,
        },
    },
    {
        id: "exam-pub-002",
        title: "Operating Systems Final",
        description: "Scheduling, memory, file systems, and concurrency.",
        timeLimit: 120,
        passingScore: 75,
        status: "Published",
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: true,
            allowReview: false,
            randomizeChoices: true,
        },
        questions: [
            {
                id: "q-101",
                type: "essay",
                prompt: "Explain the difference between preemptive and non-preemptive scheduling.",
                points: 10,
                rubric: "Compare concepts, give examples, and discuss pros/cons.",
                maxLength: 800,
            },
            {
                id: "q-102",
                type: "matching",
                prompt: "Match each concept to its description.",
                points: 6,
                pairs: [
                    { left: "Thrashing", right: "Excessive paging overhead" },
                    { left: "Semaphore", right: "Synchronization primitive" },
                    { left: "Inode", right: "Metadata for file" },
                ],
            },
            {
                id: "q-103",
                type: "fill_blank",
                prompt: "The ___ scheduler chooses which process runs next.",
                points: 3,
                blanks: ["CPU"],
            },
        ],
        createdAt: "2026-02-20T06:00:00.000Z",
        updatedAt: "2026-03-01T10:00:00.000Z",
        publishedAt: "2026-03-02T09:00:00.000Z",
        share: {
            visibility: "public",
            password: "",
            link: "https://sentinel.app/exams/exam-pub-002",
            embedCode: "<iframe src=\"https://sentinel.app/exams/exam-pub-002\"></iframe>",
        },
        assignment: {
            studentIds: ["stu-001", "stu-002", "stu-004"],
            groupIds: ["grp-102"],
            dueDate: "2026-03-25",
            dueTime: "17:00",
            instructions: "Make sure to attempt all essay questions.",
            notify: true,
        },
    },
    {
        id: "exam-arc-003",
        title: "Intro to AI Quiz 1",
        description: "Fundamentals of search and knowledge representation.",
        timeLimit: 45,
        passingScore: 65,
        status: "Archived",
        settings: {
            shuffleQuestions: false,
            showCorrectAnswers: true,
            allowReview: true,
            randomizeChoices: false,
        },
        questions: [
            {
                id: "q-201",
                type: "multiple_choice",
                prompt: "Which algorithm guarantees the shortest path in an unweighted graph?",
                points: 2,
                options: ["DFS", "BFS", "A*", "Hill Climbing"],
                correctOption: 1,
            },
            {
                id: "q-202",
                type: "identification",
                prompt: "What is a heuristic function used for?",
                points: 2,
                acceptedAnswers: ["Estimate cost", "Estimate distance", "Heuristic"],
            },
        ],
        createdAt: "2026-01-15T04:30:00.000Z",
        updatedAt: "2026-02-10T12:00:00.000Z",
        publishedAt: "2026-01-20T08:00:00.000Z",
        share: {
            visibility: "private",
            password: "",
            link: "https://sentinel.app/exams/exam-arc-003",
            embedCode: "<iframe src=\"https://sentinel.app/exams/exam-arc-003\"></iframe>",
        },
        assignment: {
            studentIds: [],
            groupIds: ["grp-201"],
            dueDate: "2026-02-15",
            dueTime: "23:59",
            instructions: "Archived for reference only.",
            notify: false,
        },
    },
];
