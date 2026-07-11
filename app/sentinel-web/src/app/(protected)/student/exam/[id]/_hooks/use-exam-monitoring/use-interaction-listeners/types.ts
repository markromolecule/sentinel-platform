import type { ExamConfig } from '@sentinel/shared/types';
import { type SecurityLockReason } from '../../../_lib/exam-session-storage';
import {
    type TelemetryActionMetadata,
    type BrowserTelemetryEventType,
} from '../../../_lib/web-telemetry-client';

export interface BaseListenerOptions {
    configuration?: ExamConfig;
    examSessionId?: string;
    isMonitoringSuspended: React.MutableRefObject<boolean>;
    isMobile: boolean;
    emitTelemetryEvent: (
        eventType: BrowserTelemetryEventType,
        metadata?: TelemetryActionMetadata,
    ) => void;
    lockExam: (reason: SecurityLockReason) => void;
}
