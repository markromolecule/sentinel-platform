import { describe, expect, it } from 'vitest';
import { detectScreenCaptureShortcut } from './screen-capture-shortcut';

describe('detectScreenCaptureShortcut', () => {
    it('detects the PrintScreen key', () => {
        expect(
            detectScreenCaptureShortcut({
                event: {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    metaKey: false,
                    shiftKey: false,
                    repeat: false,
                },
                isMobile: false,
            }),
        ).toEqual({
            detected: true,
            shortcut: 'print-screen',
        });
    });

    it.each([
        { key: '3', code: 'Digit3' },
        { key: '4', code: 'Digit4' },
        { key: '5', code: 'Digit5' },
    ])('detects macOS Cmd+Shift+$key screenshot shortcuts', ({ key, code }) => {
        expect(
            detectScreenCaptureShortcut({
                event: {
                    key,
                    code,
                    metaKey: true,
                    shiftKey: true,
                    repeat: false,
                },
                isMobile: false,
            }),
        ).toEqual({
            detected: true,
            shortcut: 'macos-screenshot',
        });
    });

    it('detects the Windows Meta+Shift+S snipping shortcut', () => {
        expect(
            detectScreenCaptureShortcut({
                event: {
                    key: 's',
                    code: 'KeyS',
                    metaKey: true,
                    shiftKey: true,
                    repeat: false,
                },
                isMobile: false,
            }),
        ).toEqual({
            detected: true,
            shortcut: 'windows-snipping',
        });
    });

    it('ignores near misses that do not match the supported combinations', () => {
        expect(
            detectScreenCaptureShortcut({
                event: {
                    key: 'p',
                    code: 'KeyP',
                    metaKey: true,
                    shiftKey: true,
                    repeat: false,
                },
                isMobile: false,
            }),
        ).toEqual({
            detected: false,
            shortcut: null,
        });

        expect(
            detectScreenCaptureShortcut({
                event: {
                    key: '3',
                    code: 'Digit3',
                    metaKey: true,
                    shiftKey: false,
                    repeat: false,
                },
                isMobile: false,
            }),
        ).toEqual({
            detected: false,
            shortcut: null,
        });
    });

    it('still classifies repeated delivered shortcut events and leaves burst suppression to the caller', () => {
        expect(
            detectScreenCaptureShortcut({
                event: {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    metaKey: false,
                    shiftKey: false,
                    repeat: true,
                },
                isMobile: false,
            }),
        ).toEqual({
            detected: true,
            shortcut: 'print-screen',
        });
    });

    it('skips desktop shortcut detection on mobile clients', () => {
        expect(
            detectScreenCaptureShortcut({
                event: {
                    key: 'PrintScreen',
                    code: 'PrintScreen',
                    metaKey: false,
                    shiftKey: false,
                    repeat: false,
                },
                isMobile: true,
            }),
        ).toEqual({
            detected: false,
            shortcut: null,
        });
    });
});
