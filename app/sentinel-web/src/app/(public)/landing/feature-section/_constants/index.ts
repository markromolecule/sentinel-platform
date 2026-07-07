export type FEATURE = {
    id: string;
    title: string;
    description: string;
    stat: string;
};

export const FEATURE_ITEMS: FEATURE[] = [
    {
        id: 'gaze',
        title: 'Gaze Monitoring',
        description: 'Track focus shifts during live exams.',
        stat: 'Live visibility',
    },
    {
        id: 'audio',
        title: 'Audio Detection',
        description: 'Surface suspicious sound patterns faster.',
        stat: 'Clearer signals',
    },
    {
        id: 'mobile',
        title: 'Mobile Security',
        description: 'Support guided device-based exam sessions.',
        stat: 'Web + mobile',
    },
];
