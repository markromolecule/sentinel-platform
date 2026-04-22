import { getMediaPipeClientCapabilities } from '@sentinel/shared';

function detectBrowser(userAgent: string) {
    if (userAgent.includes('Edg/')) {
        return 'Edge';
    }

    if (userAgent.includes('Chrome/')) {
        return 'Chrome';
    }

    if (userAgent.includes('Firefox/')) {
        return 'Firefox';
    }

    if (userAgent.includes('Safari/')) {
        return 'Safari';
    }

    return 'Unknown';
}

function detectOperatingSystem(userAgent: string) {
    if (userAgent.includes('Windows')) {
        return 'Windows';
    }

    if (userAgent.includes('Mac OS X')) {
        return 'macOS';
    }

    if (userAgent.includes('Android')) {
        return 'Android';
    }

    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        return 'iOS';
    }

    if (userAgent.includes('Linux')) {
        return 'Linux';
    }

    return 'Unknown';
}

function detectDeviceType(userAgent: string) {
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) {
        return 'TABLET' as const;
    }

    if (/Mobile|iPhone|Android/i.test(userAgent)) {
        return 'MOBILE' as const;
    }

    return 'DESKTOP' as const;
}

export function buildSessionContext() {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const userAgent = window.navigator.userAgent;

    return {
        browser: detectBrowser(userAgent),
        os: detectOperatingSystem(userAgent),
        deviceType: detectDeviceType(userAgent),
        clientCapabilities: getMediaPipeClientCapabilities(),
    };
}
