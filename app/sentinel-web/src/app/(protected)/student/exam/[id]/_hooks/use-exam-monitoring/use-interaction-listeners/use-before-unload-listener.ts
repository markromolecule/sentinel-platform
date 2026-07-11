import { useEffect } from 'react';
import type { ExamConfig } from '@sentinel/shared/types';

export interface BeforeUnloadListenerOptions {
    configuration?: ExamConfig;
    isMonitoringSuspended: React.MutableRefObject<boolean>;
}

export function useBeforeUnloadListener(options: BeforeUnloadListenerOptions) {
    const { configuration, isMonitoringSuspended } = options;

    useEffect(() => {
        const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
            const shouldWarn =
                configuration?.screenLock ||
                configuration?.webSecurity.full_screen_required ||
                configuration?.mobileSecurity.prevent_backgrounding;
            if (!isMonitoringSuspended.current && shouldWarn) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, [configuration, isMonitoringSuspended]);
}
