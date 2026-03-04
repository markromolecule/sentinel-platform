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
            'AI-powered eye movement analysis detects when students look away from the screen, flagging potential cheating attempts in real time.',
    },
    {
        id: 'audio',
        title: 'Audio Analysis',
        description:
            'Continuous ambient sound monitoring automatically flags suspicious noise, whispers, or external communication during the exam.',
    },
    {
        id: 'mobile',
        title: 'Mobile Proctoring',
        description:
            'A dedicated Android app turns any smartphone into a secondary monitoring camera, providing a wider view of the exam environment.',
    },
];
