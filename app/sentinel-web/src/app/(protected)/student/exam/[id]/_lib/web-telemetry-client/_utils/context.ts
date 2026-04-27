import { getMediaPipeClientCapabilities } from '@sentinel/shared';
import type { TelemetrySessionContext } from '@sentinel/services';
import { detectBrowser, detectOperatingSystem, detectDeviceType } from './detection';

export function buildWebTelemetrySessionContext(): TelemetrySessionContext | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const userAgent = window.navigator.userAgent;

    return {
        browser: detectBrowser(userAgent),
        os: detectOperatingSystem(userAgent),
        deviceType: detectDeviceType(userAgent),
        clientCapabilities: [
            'visibility-monitor',
            'fullscreen-monitor',
            'clipboard-monitor',
            'contextmenu-monitor',
            'print-screen-monitor',
        ],
    };
}

export function buildMediaPipeTelemetrySessionContext(): TelemetrySessionContext | undefined {
    const sessionContext = buildWebTelemetrySessionContext();

    if (!sessionContext) {
        return undefined;
    }

    return {
        ...sessionContext,
        clientCapabilities: Array.from(
            new Set([
                ...(sessionContext.clientCapabilities ?? []),
                ...getMediaPipeClientCapabilities(),
            ]),
        ),
    };
}
