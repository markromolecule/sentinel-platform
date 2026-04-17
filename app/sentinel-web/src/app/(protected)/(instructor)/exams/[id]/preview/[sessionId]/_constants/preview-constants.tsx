import { Clock3, FileText, LayoutPanelLeft, MonitorSmartphone, ShieldCheck, Timer, Users, Wifi, FileCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export const INSTRUCTION_READINESS_ITEMS = [
    'Close unnecessary apps and tabs before starting.',
    'Keep your device plugged in for the entire session.',
    'Clear your desk of prohibited materials.',
    'Stay within camera view throughout the preview.',
];

export const LOBBY_READINESS_ITEMS = [
    'Students who passed the checkup can wait here before entry.',
    'The lobby confirms that the exam environment is ready.',
    'Continuing from this page opens the live attempt preview.',
];

export const CHECKUP_READINESS_ITEMS = [
    'Keep your face centered in the camera view.',
    'Use a quiet space before entering the lobby.',
    'Allow required permissions before proceeding.',
];

export const PRIVACY_STATIC_HIGHLIGHTS = [
    { label: 'Privacy Law', value: 'RA 10173', icon: ShieldCheck },
    { label: 'Encryption', value: 'AES-256', icon: Lock },
    { label: 'Access', value: 'Institutional', icon: FileCheck },
];

export interface PolicyDefinition {
    title: string;
    content: ReactNode;
}

export const PRIVACY_POLICIES: PolicyDefinition[] = [
    {
        title: 'RA 10173 compliance',
        content:
            'Collected biometric and audio data is processed under the Data Privacy Act of 2012 for transparency, security, and legitimate academic use.',
    },
    {
        title: 'Academic integrity',
        content: (
            <>
                Continuing means the student acknowledges the institutional{' '}
                <Link href="/terms-of-service" className="text-primary font-medium hover:underline">
                    Terms of Service
                </Link>{' '}
                for conduct, monitoring, and readiness requirements.
            </>
        ),
    },
    {
        title: 'Data security',
        content:
            'Access to recordings, logs, and reports is limited to authorized proctors and institutional administrators.',
    },
];

export const COMMON_HIGHLIGHT_ICONS = {
    Duration: Clock3,
    DurationLobby: Timer,
    Items: FileText,
    Platform: LayoutPanelLeft,
    Security: MonitorSmartphone,
    LobbyCount: Users,
    Reconnect: ShieldCheck,
    ExamState: Wifi,
};
