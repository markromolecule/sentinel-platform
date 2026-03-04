export interface FEATURE {
    id: string;
    title: string;
    description: string;
}

export const FEATURE_ITEMS: FEATURE[] = [
    {
        id: 'gaze',
        title: 'Gaze Tracking',
        description:
            'Monitors eye & head movement patterns to detect suspicious behavior without being intrusive.',
    },
    {
        id: 'audio',
        title: 'Audio Environment Analysis',
        description: 'Monitors audio environment to detect communication or noise.',
    },
    {
        id: 'mobile',
        title: 'Native Mobile App',
        description: 'Dedicated Android app for secure monitoring and real-time exam management.',
    },
];
