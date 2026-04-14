import React from 'react';
import {
    MonitorOff,
    EyeOff,
    VolumeX,
    Camera,
    Eye,
    CheckCircle,
    AlertTriangle,
    Clock,
    Smartphone,
    BellOff,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { TELEMETRY_INCIDENT_LABELS } from '../../../../../schema/telemetry/telemetry-schema';
import { FlagType, StudentSession } from '../../../../../types/proctor/exams/[id]/monitoring';

export const MOCK_EXAM = {
    id: '1',
    title: 'Data Structures Midterm',
    subject: 'Data Structures',
    duration: 120,
    startedAt: '2026-01-28T14:00:00',
    endsAt: '2026-01-28T16:00:00',
};

export const MOCK_STUDENTS: StudentSession[] = [
    {
        id: '1',
        studentNo: '2024-00123',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        status: 'active',
        progress: 65,
        lastActivity: '2 min ago',
        flags: [],
    },
    {
        id: '2',
        studentNo: '2024-00124',
        firstName: 'Maria',
        lastName: 'Garcia',
        status: 'flagged',
        progress: 45,
        lastActivity: 'Just now',
        flags: [
            {
                id: 'f1',
                type: 'TAB_SWITCH',
                timestamp: '2026-01-28T14:32:00',
                description: 'Switched to another browser tab',
                severity: 'medium',
            },
            {
                id: 'f2',
                type: 'GAZE',
                timestamp: '2026-01-28T14:35:00',
                description: 'Looking away from screen for 8 seconds',
                severity: 'high',
                snapshotUrl: '/placeholder-snapshot.jpg',
            },
        ],
    },
    {
        id: '3',
        studentNo: '2024-00125',
        firstName: 'Pedro',
        lastName: 'Reyes',
        status: 'active',
        progress: 80,
        lastActivity: '1 min ago',
        flags: [
            {
                id: 'f3',
                type: 'AUDIO_DETECTED',
                timestamp: '2026-01-28T14:28:00',
                description: 'Background voices detected',
                severity: 'low',
            },
        ],
    },
    {
        id: '4',
        studentNo: '2024-00126',
        firstName: 'Ana',
        lastName: 'Santos',
        status: 'submitted',
        progress: 100,
        lastActivity: '15 min ago',
        flags: [],
    },
    {
        id: '5',
        studentNo: '2024-00127',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        status: 'disconnected',
        progress: 30,
        lastActivity: '5 min ago',
        flags: [
            {
                id: 'f4',
                type: 'APP_BACKGROUNDING',
                timestamp: '2026-01-28T14:40:00',
                description: 'Exam app moved to background during an active attempt',
                severity: 'high',
            },
        ],
    },
];

export const flagIcons: Record<FlagType, React.ReactNode> = {
    FACE_NOT_VISIBLE: React.createElement(EyeOff, { className: 'w-4 h-4' }),
    MULTIPLE_FACES: React.createElement(Users, { className: 'w-4 h-4' }),
    TAB_SWITCH: React.createElement(MonitorOff, { className: 'w-4 h-4' }),
    AUDIO_DETECTED: React.createElement(VolumeX, { className: 'w-4 h-4' }),
    SUSPICIOUS_MOVEMENT: React.createElement(AlertTriangle, { className: 'w-4 h-4' }),
    SCREENSHOT: React.createElement(Camera, { className: 'w-4 h-4' }),
    SCREEN_RECORD: React.createElement(Camera, { className: 'w-4 h-4' }),
    GAZE: React.createElement(EyeOff, { className: 'w-4 h-4' }),
    APP_BACKGROUNDING: React.createElement(Smartphone, { className: 'w-4 h-4' }),
    ROOT_JAILBREAK_DETECTED: React.createElement(ShieldAlert, { className: 'w-4 h-4' }),
    APP_PINNING_VIOLATION: React.createElement(Smartphone, { className: 'w-4 h-4' }),
    NOTIFICATION_BLOCK_VIOLATION: React.createElement(BellOff, { className: 'w-4 h-4' }),
};

export const flagLabels: Record<FlagType, string> = {
    ...TELEMETRY_INCIDENT_LABELS,
};

export const severityColors: Record<string, string> = {
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-red-100 text-red-700 border-red-200',
};

export const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> =
    {
        active: {
            color: 'bg-emerald-100 text-emerald-700',
            icon: React.createElement(Eye, { className: 'w-3 h-3' }),
            label: 'Active',
        },
        submitted: {
            color: 'bg-blue-100 text-blue-700',
            icon: React.createElement(CheckCircle, { className: 'w-3 h-3' }),
            label: 'Submitted',
        },
        flagged: {
            color: 'bg-red-100 text-red-700',
            icon: React.createElement(AlertTriangle, { className: 'w-3 h-3' }),
            label: 'Flagged',
        },
        disconnected: {
            color: 'bg-gray-100 text-gray-700',
            icon: React.createElement(Clock, { className: 'w-3 h-3' }),
            label: 'Disconnected',
        },
    };
