'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@sentinel/hooks';
import { MOBILE_USER_AGENT_REGEX } from '@sentinel/shared/constants';
import { useTelemetry } from './use-telemetry';
import { useSecurityLock } from './use-security-lock';
import { useInteractionListeners } from './use-interaction-listeners';
import type { UseExamMonitoringArgs, UseExamMonitoringResult } from './_types';

export * from './_types';

export function useExamMonitoring({
    configuration,
    examSessionId,
    examId,
    isMonitoringSuspended = false,
}: UseExamMonitoringArgs): UseExamMonitoringResult {
    const { user } = useAuth();
    const [tabSwitches, setTabSwitches] = useState(0);
    const isMonitoringSuspendedRef = useRef(isMonitoringSuspended);
    const studentId = user?.id;

    const isMobile =
        typeof window !== 'undefined' && MOBILE_USER_AGENT_REGEX.test(window.navigator.userAgent);
    const shouldMonitorVisibility = isMobile
        ? (configuration?.mobileSecurity.prevent_backgrounding ?? true)
        : (configuration?.webSecurity.tab_switching_monitor ?? true);
    const shouldMonitorFullscreen =
        !isMobile && (configuration?.webSecurity.full_screen_required ?? true);

    useEffect(() => {
        isMonitoringSuspendedRef.current = isMonitoringSuspended;
    }, [isMonitoringSuspended]);

    const { emitTelemetryEvent } = useTelemetry({
        configuration,
        examSessionId,
        studentId,
        isMonitoringSuspended: isMonitoringSuspendedRef,
        isMobile,
    });

    const {
        securityLockReason,
        isResumingExam,
        fullScreenContainerRef,
        lockExam,
        resumeSecuredExam,
        suspendSecurityMonitoring,
    } = useSecurityLock({
        examId,
        shouldMonitorFullscreen,
        isMonitoringSuspended: isMonitoringSuspendedRef,
    });

    useInteractionListeners({
        configuration,
        isMonitoringSuspended: isMonitoringSuspendedRef,
        isMobile,
        shouldMonitorVisibility,
        shouldMonitorFullscreen,
        emitTelemetryEvent,
        lockExam,
        setTabSwitches,
    });

    return {
        tabSwitches,
        isMobile,
        securityLockReason,
        isResumingExam,
        resumeSecuredExam,
        fullScreenContainerRef,
        suspendSecurityMonitoring,
    };
}
