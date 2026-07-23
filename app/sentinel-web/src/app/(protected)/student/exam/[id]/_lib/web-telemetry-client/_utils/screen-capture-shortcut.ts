/**
 * Minimal keyboard-event shape required to classify browser-delivered
 * screen-capture shortcuts.
 */
export type ScreenCaptureShortcutKeyboardEvent = Pick<
    KeyboardEvent,
    'key' | 'code' | 'metaKey' | 'shiftKey' | 'repeat'
>;

/**
 * Canonical shortcut identifiers used by attempt-page monitoring.
 */
export type ScreenCaptureShortcutType = 'print-screen' | 'macos-screenshot' | 'windows-snipping';

/**
 * Result returned from browser screen-capture shortcut detection.
 */
export type ScreenCaptureShortcutDetection = {
    detected: boolean;
    shortcut: ScreenCaptureShortcutType | null;
};

/**
 * Detects browser-delivered screen-capture shortcuts for desktop platforms.
 *
 * Supported combinations:
 * - `PrintScreen`
 * - macOS `Cmd+Shift+3`, `Cmd+Shift+4`, `Cmd+Shift+5`
 * - Windows `Meta+Shift+S`
 *
 * This is intentionally best effort. If the operating system intercepts the
 * shortcut before the browser receives the keyboard event, detection is not
 * possible.
 *
 * @param args.event The keyboard event payload to inspect.
 * @param args.isMobile Whether the current client is mobile/tablet and should skip desktop detection.
 * @returns The normalized detection result for the delivered shortcut.
 */
export function detectScreenCaptureShortcut(args: {
    event: ScreenCaptureShortcutKeyboardEvent;
    isMobile: boolean;
}): ScreenCaptureShortcutDetection {
    if (args.isMobile) {
        return {
            detected: false,
            shortcut: null,
        };
    }

    const normalizedKey = args.event.key.toLowerCase();
    const normalizedCode = args.event.code.toLowerCase();
    const isPrintScreenKey =
        args.event.key === 'PrintScreen' ||
        args.event.code === 'PrintScreen' ||
        normalizedKey === 'printscreen' ||
        normalizedCode === 'printscreen';

    if (isPrintScreenKey) {
        return {
            detected: true,
            shortcut: 'print-screen',
        };
    }

    const isMacCaptureShortcut =
        args.event.metaKey &&
        args.event.shiftKey &&
        (['3', '4', '5'].includes(normalizedKey) ||
            ['digit3', 'digit4', 'digit5'].includes(normalizedCode));

    if (isMacCaptureShortcut) {
        return {
            detected: true,
            shortcut: 'macos-screenshot',
        };
    }

    const isWindowsCaptureShortcut =
        args.event.metaKey &&
        args.event.shiftKey &&
        (normalizedKey === 's' || normalizedCode === 'keys');

    if (isWindowsCaptureShortcut) {
        return {
            detected: true,
            shortcut: 'windows-snipping',
        };
    }

    return {
        detected: false,
        shortcut: null,
    };
}
