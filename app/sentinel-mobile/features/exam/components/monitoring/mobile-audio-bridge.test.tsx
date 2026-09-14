import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock React with importOriginal to preserve createElement while mocking hooks
let effectCallbacks: Array<() => void | (() => void)> = [];
const mockPostMessage = vi.fn();

vi.mock('react', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        default: actual.default || actual,
        useRef: (initial: any) => {
            if (initial === null) {
                return { current: { postMessage: mockPostMessage } };
            }
            return { current: initial };
        },
        useEffect: (callback: () => void | (() => void)) => {
            effectCallbacks.push(callback);
        },
        useMemo: (callback: () => any) => callback(),
        useCallback: (fn: any) => fn,
    };
});

// Mock react-native
vi.mock('react-native', () => ({
    View: (props: any) => ({ type: 'View', props }),
    StyleSheet: {
        create: (styles: any) => styles,
    },
}));

// Mock WebView
vi.mock('react-native-webview', () => {
    const ReactModule = require('react');
    class WebView extends ReactModule.Component<any> {
        postMessage = mockPostMessage;
        render() {
            return { type: 'WebView', props: this.props };
        }
    }
    return { WebView };
});

import { MobileAudioBridge } from './mobile-audio-bridge';
import { buildMobileAudioBridgeHtml } from './mobile-audio-bridge-html';
import { DEFAULT_AUDIO_ANOMALY_CONFIG } from '@sentinel/shared';

describe('MobileAudioBridge', () => {
    beforeEach(() => {
        effectCallbacks = [];
        vi.clearAllMocks();
    });

    it('renders the bridge container with WebView and generated HTML', () => {
        const onAnomaly = vi.fn();
        const tree = MobileAudioBridge({
            enabled: true,
            onAnomalyDetected: onAnomaly,
        });

        expect(tree.props.testID).toBe('mobile-audio-bridge-container');

        const webview = tree.props.children;
        expect(webview.props.source.html).toContain('Sentinel Mobile Audio Bridge');
        expect(webview.props.source.html).toContain('tensorflow');
        expect(webview.props.mediaCapturePermissionGrantType).toBe('grant');
    });

    it('buildMobileAudioBridgeHtml generates valid HTML containing YAMNet configurations', () => {
        const html = buildMobileAudioBridgeHtml({
            initialConfig: {
                ...DEFAULT_AUDIO_ANOMALY_CONFIG,
                cooldownMs: 15000,
            },
        });

        expect(html).toContain('Sentinel Mobile Audio Bridge');
        expect(html).toContain('15000');
        expect(html).toContain('TARGET_SAMPLE_RATE = 16000');
        expect(html).toContain('EXPECTED_SAMPLES = 15600');
        expect(html).toContain('clampThreshold');
    });

    it('handles status messages and invokes onStatusChange', () => {
        const onStatusChange = vi.fn();
        const tree = MobileAudioBridge({
            enabled: true,
            onAnomalyDetected: vi.fn(),
            onStatusChange,
        });

        const webview = tree.props.children;
        const mockEvent = {
            nativeEvent: {
                data: JSON.stringify({ type: 'status', status: 'ready' }),
            },
        };

        webview.props.onMessage(mockEvent);
        expect(onStatusChange).toHaveBeenCalledWith('ready');
    });

    it('sends start message when enabled and status reaches ready', () => {
        const tree = MobileAudioBridge({
            enabled: true,
            onAnomalyDetected: vi.fn(),
        });

        const webview = tree.props.children;
        webview.props.onMessage({
            nativeEvent: {
                data: JSON.stringify({ type: 'status', status: 'ready' }),
            },
        });

        expect(mockPostMessage).toHaveBeenCalledWith(JSON.stringify({ type: 'start' }));
    });

    it('handles anomaly message and invokes onAnomalyDetected with qualified label and confidence', () => {
        const onAnomalyDetected = vi.fn();
        const tree = MobileAudioBridge({
            enabled: true,
            onAnomalyDetected,
        });

        const webview = tree.props.children;
        const mockAnomalyEvent = {
            nativeEvent: {
                data: JSON.stringify({
                    type: 'anomaly',
                    anomalyType: 'TALKING',
                    confidenceScore: 0.88,
                    detectedAt: '2026-09-14T12:00:00.000Z',
                }),
            },
        };

        webview.props.onMessage(mockAnomalyEvent);

        expect(onAnomalyDetected).toHaveBeenCalledTimes(1);
        expect(onAnomalyDetected).toHaveBeenCalledWith({
            anomalyType: 'TALKING',
            confidenceScore: 0.88,
            detectedAt: '2026-09-14T12:00:00.000Z',
        });
    });

    it('handles error message and invokes onError callback', () => {
        const onError = vi.fn();
        const tree = MobileAudioBridge({
            enabled: true,
            onAnomalyDetected: vi.fn(),
            onError,
        });

        const webview = tree.props.children;
        const mockErrorEvent = {
            nativeEvent: {
                data: JSON.stringify({
                    type: 'error',
                    error: {
                        code: 'permission_denied',
                        message: 'Microphone permission denied',
                    },
                }),
            },
        };

        webview.props.onMessage(mockErrorEvent);

        expect(onError).toHaveBeenCalledWith({
            code: 'permission_denied',
            message: 'Microphone permission denied',
        });
    });

    it('grants permission when onPermissionRequest is invoked on Android', () => {
        const tree = MobileAudioBridge({
            enabled: true,
            onAnomalyDetected: vi.fn(),
        });

        const webview = tree.props.children;
        const mockGrant = vi.fn();
        webview.props.onPermissionRequest({
            grant: mockGrant,
            resources: ['microphone'],
        });

        expect(mockGrant).toHaveBeenCalledWith(['microphone']);
    });
});
