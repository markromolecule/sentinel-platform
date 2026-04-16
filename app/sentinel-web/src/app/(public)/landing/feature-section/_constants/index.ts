export type FEATURE = {
    id: string;
    title: string;
    description: string;
};

export const FEATURE_ITEMS: FEATURE[] = [
    {
        id: 'gaze',
        title: 'Gaze Tracking',
        description:
            'Tracks eye movement to instantly flag if a student looks away from the screen.',
    },
    {
        id: 'audio',
        title: 'Audio Analysis',
        description:
            'Listens for whispers, talking, or suspicious background noises during the exam.',
    },
    {
        id: 'mobile',
        title: 'Mobile Proctoring',
        description: 'A dedicated Android app for flexible examination for institutions.',
    },
];
