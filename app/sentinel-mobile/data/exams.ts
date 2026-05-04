import type { ExamConfiguration, ExamSettings } from '@sentinel/shared/types';

export interface Exam {
    id: string;
    title: string;
    subject: string;
    duration: number; // in minutes
    professor: string;
    status: 'available' | 'upcoming' | 'completed' | 'past_due' | 'turned_in';
    date?: string;
    description: string;
    instructions: string[];
    questions: number;
    passingPercentage: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    section?: string;
    room?: string;
    settings: ExamSettings;
    configuration: ExamConfiguration;
}

const DEFAULT_EXAM_SETTINGS: ExamSettings = {
    shuffleQuestions: true,
    showCorrectAnswers: false,
    allowReview: true,
    randomizeChoices: true,
};

const DEFAULT_EXAM_CONFIGURATION: ExamConfiguration = {
    lobbyAdmissionMode: 'AUTOMATIC',
    maxReconnectAttempts: 3,
    strictMode: true,
    screenLock: true,
    cameraRequired: true,
    micRequired: true,
    autoSubmitTimeoutMinutes: 5,
    aiRules: {
        gaze_tracking: true,
        face_detection: true,
        audio_anomaly_detection: true,
        multiple_faces_detection: true,
    },
    webSecurity: {
        tab_switching_monitor: true,
        full_screen_required: true,
        clipboard_control: true,
        right_click_disable: true,
        print_screen_disable: true,
    },
    mobileSecurity: {
        app_pinning_required: true,
        prevent_backgrounding: true,
        notification_block: true,
        screenshot_block: true,
        root_jailbreak_detection: true,
    },
};

export const mockExams: Exam[] = [
    {
        id: '1',
        title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        duration: 120,
        professor: 'Dr. Alan Turing',
        section: 'BSIT-1A',
        room: 'Room 301',
        status: 'available',
        description: 'Comprehensive final exam covering algebra, geometry, and calculus',
        instructions: [
            'Ensure stable internet connection.',
            'Full-screen mode will be enforced.',
            'No tab switching allowed.',
            'Review answers before submitting.',
        ],
        questions: 50,
        passingPercentage: 70,
        difficulty: 'Hard',
        settings: DEFAULT_EXAM_SETTINGS,
        configuration: DEFAULT_EXAM_CONFIGURATION,
    },
    {
        id: '2',
        title: 'English Literature Quiz',
        subject: 'English',
        duration: 45,
        professor: 'Prof. J.K. Rowling',
        section: 'BSIT-1B',
        status: 'upcoming',
        date: '2026-02-15',
        description: 'Assessment on Shakespeare and modern literature themes',
        instructions: [
            'Read all questions carefully.',
            'Answer in complete sentences.',
            'Cite examples from the texts.',
        ],
        questions: 25,
        passingPercentage: 60,
        difficulty: 'Medium',
        settings: DEFAULT_EXAM_SETTINGS,
        configuration: DEFAULT_EXAM_CONFIGURATION,
    },
    {
        id: '3',
        title: 'Science Practical Exam',
        subject: 'Science',
        duration: 90,
        professor: 'Dr. Marie Curie',
        room: 'Lab 1',
        status: 'past_due',
        description: 'Hands-on laboratory assessment covering physics and chemistry experiments',
        instructions: [
            'Follow safety protocols.',
            'Document all observations.',
            'Complete within time limit.',
            'Submit all findings before leaving.',
        ],
        questions: 35,
        passingPercentage: 65,
        difficulty: 'Hard',
        settings: DEFAULT_EXAM_SETTINGS,
        configuration: DEFAULT_EXAM_CONFIGURATION,
    },
    {
        id: '4',
        title: 'History Midterm',
        subject: 'History',
        duration: 60,
        professor: 'Prof. Yuval Noah Harari',
        section: 'BSIT-1C',
        status: 'upcoming',
        date: '2026-02-18',
        description: 'Midterm covering World War II and post-war developments',
        instructions: [
            'Multiple choice and essay format.',
            'Use historical evidence.',
            'Stay within word limits.',
        ],
        questions: 40,
        passingPercentage: 70,
        difficulty: 'Medium',
        settings: DEFAULT_EXAM_SETTINGS,
        configuration: DEFAULT_EXAM_CONFIGURATION,
    },
    {
        id: '5',
        title: 'Computer Science Quiz',
        subject: 'Computer Science',
        duration: 30,
        professor: 'Dr. Ada Lovelace',
        section: 'BSIT-2A',
        room: 'Room 102',
        status: 'available',
        description: 'Quick assessment on algorithms and data structures',
        instructions: ['Code snippets required.', 'Explain your logic.', 'Test your solutions.'],
        questions: 20,
        passingPercentage: 75,
        difficulty: 'Easy',
        settings: DEFAULT_EXAM_SETTINGS,
        configuration: DEFAULT_EXAM_CONFIGURATION,
    },
    {
        id: '6',
        title: 'Midterm Database Systems',
        subject: 'Database',
        duration: 90,
        professor: 'Dr. E.F. Codd',
        section: 'BSIT-2B',
        status: 'turned_in',
        description: 'Midterm covering relational algebra and SQL',
        instructions: ['Answer all questions.', 'Review before submitting.'],
        questions: 30,
        passingPercentage: 70,
        difficulty: 'Medium',
        settings: DEFAULT_EXAM_SETTINGS,
        configuration: DEFAULT_EXAM_CONFIGURATION,
    },
];
