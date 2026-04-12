import { ReactNode } from 'react';

export type SystemCheckStatus = 'success' | 'pending' | 'info';

export interface SystemCheckItemProps {
    icon: ReactNode;
    title: string;
    description: string;
    status: SystemCheckStatus;
}

export interface UseSystemCheckReturn {
    hasCameraPermission: boolean | null;
    hasMicPermission: boolean | null;
    requiresCamera: boolean;
    requiresMicrophone: boolean;
    isMobile: boolean;
    stream: MediaStream | null;
    allChecksPassed: boolean;
}
