import { Smartphone, Monitor, Bot, Coins, Headset, type LucideIcon } from 'lucide-react';

export type CompareFeature = {
    name: string;
    description: string;
    sentinel: string | boolean;
    proctorU: string | boolean;
    seb: string | boolean;
    examSoft: string | boolean;
    respondus: string | boolean;
    icon: LucideIcon;
};

export const FEATURES: CompareFeature[] = [
    {
        name: 'Supported Devices',
        description: 'Access via modern web browsers or mobile apps',
        sentinel: 'Mobile & Web',
        proctorU: 'Desktop Only',
        seb: 'Desktop Only',
        examSoft: 'Desktop & iPad',
        respondus: 'Desktop & iPad',
        icon: Monitor,
    },
    {
        name: 'Tracking & Audio',
        description: 'Live gaze tracking and automated audio flags',
        sentinel: true,
        proctorU: true,
        seb: false,
        examSoft: false,
        respondus: true,
        icon: Bot,
    },
    {
        name: 'Native Mobile App',
        description: 'Dedicated Android app for secure monitoring',
        sentinel: 'Full Support',
        proctorU: 'Limited to Web',
        seb: false,
        examSoft: 'iPad Only',
        respondus: 'iPad Only',
        icon: Smartphone,
    },
    {
        name: 'Pricing Model',
        description: 'Professional plans that fit any budget',
        sentinel: 'Starts FREE',
        proctorU: '$15 / Session',
        seb: 'Open-source',
        examSoft: 'High Cost',
        respondus: 'Licensing',
        icon: Coins,
    },
    {
        name: 'Regional Support',
        description: '24/7 technical support based in the Philippines',
        sentinel: 'Local',
        proctorU: 'US-Based',
        seb: 'Community',
        examSoft: 'Global',
        respondus: 'US-Based',
        icon: Headset,
    },
];
