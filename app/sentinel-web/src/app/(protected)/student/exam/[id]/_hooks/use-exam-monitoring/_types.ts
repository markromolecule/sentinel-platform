import type { ExamConfig } from '@sentinel/shared/types';
import { type SecurityLockReason } from '../../_lib/exam-session-storage';

export type AttemptMonitoringPhase = 'active' | 'submitting' | 'navigating-to-turn-in' | 'suspended';

export type UseExamMonitoringArgs = {
    configuration?: ExamConfig;
    examSessionId?: string;
    examId: string;
    isMonitoringSuspended?: boolean;
    monitoringPhase?: AttemptMonitoringPhase;
};

export type ExamSecurityLockReason = SecurityLockReason;

export type UseExamMonitoringResult = {
    tabSwitches: number;
    isMobile: boolean;
    securityLockReason: SecurityLockReason | null;
    isResumingExam: boolean;
    resumeSecuredExam: () => Promise<void>;
    fullScreenContainerRef: React.MutableRefObject<HTMLElement | null>;
    suspendSecurityMonitoring: () => boolean;
};
