import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock React
vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        default: actual,
        useState: (initial: any) => [initial, vi.fn()],
    };
});

// Mock react-native
vi.mock('react-native', () => {
    return {
        View: (props: any) => ({ type: 'View', props }),
        Text: (props: any) => ({ type: 'Text', props }),
        TouchableOpacity: (props: any) => ({ type: 'TouchableOpacity', props }),
        ActivityIndicator: (props: any) => ({ type: 'ActivityIndicator', props }),
        StyleSheet: {
            create: (styles: any) => styles,
        },
    };
});

// Mock react-native-svg
vi.mock('react-native-svg', () => ({
    default: (props: any) => ({ type: 'Svg', props }),
    Ellipse: (props: any) => ({ type: 'Ellipse', props }),
}));

// Mock expo-camera
vi.mock('expo-camera', () => ({
    CameraView: (props: any) => ({ type: 'CameraView', props }),
}));

// Mock @expo/vector-icons
vi.mock('@expo/vector-icons', () => ({
    Ionicons: (props: any) => ({ type: 'Ionicons', props }),
}));

// Mock mobile-mediapipe-bridge
vi.mock('./mobile-mediapipe-bridge', () => ({
    MobileMediaPipeBridge: (props: any) => ({ type: 'MobileMediaPipeBridge', props }),
}));

import { getCameraStatusConfig } from './camera-preview.styles';
import { CameraPermissionPrompt } from './camera-permission-prompt';
import { CameraCalibrationGuide } from './camera-calibration-guide';
import { CameraLoadingOverlay } from './camera-loading-overlay';
import { CameraPreview } from './camera-preview';

const mockColors = {
    text: '#000',
    background: '#fff',
    tint: '#3b82f6',
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#3b82f6',
    primary: '#3b82f6',
    input: '#e5e7eb',
    border: '#e5e7eb',
    card: '#ffffff',
};

describe('CameraPreview sub-components and styles', () => {
    describe('getCameraStatusConfig helper', () => {
        it('returns red permission required when hasPermission is false', () => {
            const config = getCameraStatusConfig({
                hasPermission: false,
                cameraReady: false,
            });
            expect(config.color).toBe('#ef4444');
            expect(config.label).toBe('Permission Required');
        });

        it('returns red error when cameraError or bridgeStatus error is present', () => {
            const config = getCameraStatusConfig({
                hasPermission: true,
                cameraError: 'Mount failed',
                cameraReady: true,
            });
            expect(config.color).toBe('#ef4444');
            expect(config.label).toBe('Camera / Model Error');

            const bridgeErrorConfig = getCameraStatusConfig({
                hasPermission: true,
                bridgeStatus: 'error',
                cameraReady: true,
            });
            expect(bridgeErrorConfig.color).toBe('#ef4444');
            expect(bridgeErrorConfig.label).toBe('Camera / Model Error');
        });

        it('returns emerald green ready when cameraReady and bridge ready', () => {
            const config = getCameraStatusConfig({
                hasPermission: true,
                bridgeStatus: 'ready',
                cameraReady: true,
            });
            expect(config.color).toBe('#10b981');
            expect(config.label).toBe('Camera Ready');
        });

        it('returns amber initializing otherwise', () => {
            const config = getCameraStatusConfig({
                hasPermission: true,
                bridgeStatus: 'initializing',
                cameraReady: false,
            });
            expect(config.color).toBe('#f59e0b');
            expect(config.label).toBe('Initializing…');
        });
    });

    describe('CameraPermissionPrompt', () => {
        it('renders loading indicator when isPermissionLoading is true', () => {
            const result = CameraPermissionPrompt({
                isPermissionLoading: true,
                colors: mockColors,
                isDark: false,
            });
            expect(result).not.toBeNull();
            const children = result.props.children;
            expect(children[1].props.children).toBe('Checking camera permissions…');
        });

        it('renders permission prompt and grant button when permission not granted', () => {
            const onGrant = vi.fn();
            const result = CameraPermissionPrompt({
                isPermissionLoading: false,
                onRequestPermission: onGrant,
                colors: mockColors,
                isDark: false,
            });
            expect(result).not.toBeNull();
            const button = result.props.children[3];
            expect(button.props.accessibilityLabel).toBe('Grant camera permission');
            button.props.onPress();
            expect(onGrant).toHaveBeenCalledTimes(1);
        });
    });

    describe('CameraCalibrationGuide', () => {
        it('returns null when layout dimensions are 0', () => {
            const result = CameraCalibrationGuide({
                width: 0,
                height: 0,
                colors: mockColors,
            });
            expect(result).toBeNull();
        });

        it('renders SVG ellipse with green stroke when isFaceCentered is true', () => {
            const result = CameraCalibrationGuide({
                width: 300,
                height: 300,
                isFaceCentered: true,
                calibrationProgress: 50,
                colors: mockColors,
            });
            expect(result).not.toBeNull();
            const svg = (result as any).props.children[0];
            const ellipse = svg.props.children;
            expect(ellipse.props.stroke).toBe('#22c55e');
        });

        it('renders red stroke when cameraError is present', () => {
            const result = CameraCalibrationGuide({
                width: 300,
                height: 300,
                cameraError: 'Camera mount failure',
                colors: mockColors,
            });
            const svg = (result as any).props.children[0];
            const ellipse = svg.props.children;
            expect(ellipse.props.stroke).toBe('#ef4444');
        });
    });

    describe('CameraLoadingOverlay', () => {
        it('returns null when isVisible is false', () => {
            const result = CameraLoadingOverlay({
                isVisible: false,
                isBridgeLoading: false,
                colors: mockColors,
                isDark: false,
            });
            expect(result).toBeNull();
        });

        it('renders face detection initializing text when isBridgeLoading is true', () => {
            const result = CameraLoadingOverlay({
                isVisible: true,
                isBridgeLoading: true,
                colors: mockColors,
                isDark: false,
            });
            expect(result).not.toBeNull();
            const text = (result as any).props.children[1];
            expect(text.props.children).toBe('Initializing face detection…');
        });
    });

    describe('CameraPreview Component', () => {
        it('renders with MobileMediaPipeBridge when onLandmarksDetected is provided', () => {
            const onLandmarks = vi.fn();
            const result = CameraPreview({
                cameraFacing: 'front',
                cameraReady: true,
                hasPermission: true,
                onCameraReady: vi.fn(),
                onFlip: vi.fn(),
                colors: mockColors,
                isDark: false,
                onLandmarksDetected: onLandmarks,
            });

            expect(result).not.toBeNull();
            expect(result.props.children).toBeDefined();
        });

        it('renders with CameraView when onLandmarksDetected is not provided', () => {
            const result = CameraPreview({
                cameraFacing: 'front',
                cameraReady: true,
                hasPermission: true,
                onCameraReady: vi.fn(),
                onFlip: vi.fn(),
                colors: mockColors,
                isDark: false,
            });

            expect(result).not.toBeNull();
            expect(result.props.children).toBeDefined();
        });
    });
});
