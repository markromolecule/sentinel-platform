import { RuleItem } from '@/app/(protected)/(admin)/exams/configuration/_types';

export const WEB_RULES: RuleItem[] = [
    {
        name: 'aiRules.web.gazeTracking',
        label: 'Gaze Tracking',
        description: 'Monitor eye movement to detect off-screen reading.',
    },
    {
        name: 'aiRules.web.audioDetection',
        label: 'Audio Anomaly Detection',
        description: 'Analyze ambient sound for voices, whispering, or suspicious audio.',
    },
    {
        name: 'aiRules.web.tabSwitching',
        label: 'Tab Switching Monitor',
        description: 'Detect when a student switches to another browser tab or application.',
    },
    {
        name: 'aiRules.web.copyPaste',
        label: 'Copy-Paste Detection',
        description: 'Prevent and detect clipboard copy-paste actions during exams.',
    },
    {
        name: 'aiRules.web.printScreenDisable',
        label: 'Print Screen Disable',
        description: 'Block the Print Screen key to prevent screen capture.',
    },
];

export const MOBILE_RULES: RuleItem[] = [
    {
        name: 'aiRules.mobile.gazeTracking',
        label: 'Gaze Tracking',
        description: 'Monitor eye movement via front camera to detect off-screen glancing.',
    },
    {
        name: 'aiRules.mobile.audioDetection',
        label: 'Audio Anomaly Detection',
        description: 'Analyze ambient sound for voices or suspicious audio on mobile.',
    },
    {
        name: 'aiRules.mobile.appPinning',
        label: 'App Pinning',
        description: 'Lock the exam app to the foreground, preventing navigation away.',
    },
    {
        name: 'aiRules.mobile.screenshotDisable',
        label: 'Screenshot Disable',
        description: 'Prevent screenshots and screen recordings during the exam.',
    },
];
