"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusConfig = exports.severityColors = exports.flagLabels = exports.flagIcons = exports.MOCK_STUDENTS = exports.MOCK_EXAM = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
exports.MOCK_EXAM = {
    id: '1',
    title: 'Data Structures Midterm',
    subject: 'Data Structures',
    duration: 120,
    startedAt: '2026-01-28T14:00:00',
    endsAt: '2026-01-28T16:00:00',
};
exports.MOCK_STUDENTS = [
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
                type: 'tab_switch',
                timestamp: '2026-01-28T14:32:00',
                description: 'Switched to another browser tab',
                severity: 'medium',
            },
            {
                id: 'f2',
                type: 'gaze',
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
                type: 'audio',
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
                type: 'tab_switch',
                timestamp: '2026-01-28T14:40:00',
                description: 'Multiple tab switches detected (3x)',
                severity: 'high',
            },
        ],
    },
];
exports.flagIcons = {
    tab_switch: react_1.default.createElement(lucide_react_1.MonitorOff, { className: 'w-4 h-4' }),
    gaze: react_1.default.createElement(lucide_react_1.EyeOff, { className: 'w-4 h-4' }),
    audio: react_1.default.createElement(lucide_react_1.VolumeX, { className: 'w-4 h-4' }),
    screenshot: react_1.default.createElement(lucide_react_1.Camera, { className: 'w-4 h-4' }),
};
exports.flagLabels = {
    tab_switch: 'Tab Switch',
    gaze: 'Gaze Detection',
    audio: 'Audio Alert',
    screenshot: 'Snapshot Taken',
};
exports.severityColors = {
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-red-100 text-red-700 border-red-200',
};
exports.statusConfig = {
    active: {
        color: 'bg-emerald-100 text-emerald-700',
        icon: react_1.default.createElement(lucide_react_1.Eye, { className: 'w-3 h-3' }),
        label: 'Active',
    },
    submitted: {
        color: 'bg-blue-100 text-blue-700',
        icon: react_1.default.createElement(lucide_react_1.CheckCircle, { className: 'w-3 h-3' }),
        label: 'Submitted',
    },
    flagged: {
        color: 'bg-red-100 text-red-700',
        icon: react_1.default.createElement(lucide_react_1.AlertTriangle, { className: 'w-3 h-3' }),
        label: 'Flagged',
    },
    disconnected: {
        color: 'bg-gray-100 text-gray-700',
        icon: react_1.default.createElement(lucide_react_1.Clock, { className: 'w-3 h-3' }),
        label: 'Disconnected',
    },
};
//# sourceMappingURL=index.js.map