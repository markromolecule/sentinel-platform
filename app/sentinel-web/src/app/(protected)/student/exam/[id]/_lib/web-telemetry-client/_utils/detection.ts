import { MOBILE_USER_AGENT_REGEX } from '@sentinel/shared';
import type { TelemetrySessionContext } from '@sentinel/services';

export function detectBrowser(userAgent: string) {
    if (userAgent.includes('Edge/')) return 'Edge';
    if (userAgent.includes('Chrome/')) return 'Chrome';
    if (userAgent.includes('Firefox/')) return 'Firefox';
    if (userAgent.includes('Safari/')) return 'Safari';
    return 'Unknown';
}

export function detectOperatingSystem(userAgent: string) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
}

export function detectDeviceType(userAgent: string): TelemetrySessionContext['deviceType'] {
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return 'TABLET';
    if (MOBILE_USER_AGENT_REGEX.test(userAgent)) return 'MOBILE';
    return 'DESKTOP';
}
