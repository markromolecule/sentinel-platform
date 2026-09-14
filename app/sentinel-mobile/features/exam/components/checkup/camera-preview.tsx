import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { type CameraPreviewProps } from '@/types/exam';
import { MobileMediaPipeBridge } from './mobile-mediapipe-bridge';
import { CameraPermissionPrompt } from './camera-permission-prompt';
import { CameraCalibrationGuide } from './camera-calibration-guide';
import { CameraLoadingOverlay } from './camera-loading-overlay';
import { styles, getCameraStatusConfig } from './camera-preview.styles';

export function CameraPreview({
    cameraFacing,
    cameraReady,
    hasPermission = true,
    isPermissionLoading = false,
    onRequestPermission,
    onCameraReady,
    onCameraMountError,
    onFlip,
    colors,
    isDark,
    calibrationProgress,
    isCalibrated = false,
    calibrationFeedback,
    isFaceCentered = false,
    onLandmarksDetected,
    cameraError,
}: CameraPreviewProps) {
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const [bridgeStatus, setBridgeStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');

    const statusConfig = getCameraStatusConfig({
        hasPermission,
        cameraError,
        bridgeStatus,
        cameraReady,
    });

    const isGuideVisible = cameraReady && bridgeStatus !== 'initializing' && !isCalibrated;
    const isLoadingVisible = !cameraReady || (Boolean(onLandmarksDetected) && bridgeStatus === 'initializing');

    return (
        <View style={styles.wrapper}>
            <Text style={[styles.sectionTitle, { color: colors.icon }]}>
                CAMERA PREVIEW
            </Text>

            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    },
                ]}
            >
                {/* Camera Feed */}
                <View
                    onLayout={(e) => {
                        const { width, height } = e.nativeEvent.layout;
                        setLayout({ width, height });
                    }}
                    style={[
                        styles.feedContainer,
                        { backgroundColor: isDark ? '#111' : '#f0f0f0' },
                    ]}
                >
                    {isPermissionLoading || !hasPermission ? (
                        <CameraPermissionPrompt
                            isPermissionLoading={isPermissionLoading}
                            onRequestPermission={onRequestPermission}
                            colors={colors}
                            isDark={isDark}
                        />
                    ) : (
                        <>
                            {onLandmarksDetected ? (
                                <MobileMediaPipeBridge
                                    onLandmarksDetected={onLandmarksDetected}
                                    onStatusChange={(status) => {
                                        setBridgeStatus(status);
                                        if (status === 'ready' && onCameraReady) {
                                            onCameraReady();
                                        }
                                    }}
                                    onError={(err) => {
                                        setBridgeStatus('error');
                                        if (onCameraMountError) {
                                            onCameraMountError(err);
                                        }
                                    }}
                                    facing={cameraFacing}
                                    showPreview={true}
                                />
                            ) : (
                                <CameraView
                                    key={`${cameraFacing}-${hasPermission}`}
                                    style={{ flex: 1 }}
                                    facing={cameraFacing}
                                    onCameraReady={onCameraReady}
                                    onMountError={onCameraMountError}
                                    mirror={cameraFacing === 'front'}
                                />
                            )}

                            {/* Calibration Ellipse Guide Overlay */}
                            {isGuideVisible && (
                                <CameraCalibrationGuide
                                    width={layout.width}
                                    height={layout.height}
                                    cameraError={cameraError}
                                    bridgeStatus={bridgeStatus}
                                    isFaceCentered={isFaceCentered}
                                    calibrationFeedback={calibrationFeedback}
                                    calibrationProgress={calibrationProgress}
                                    colors={colors}
                                />
                            )}

                            {/* Loading overlay */}
                            <CameraLoadingOverlay
                                isVisible={isLoadingVisible}
                                isBridgeLoading={bridgeStatus === 'initializing' && Boolean(onLandmarksDetected)}
                                colors={colors}
                                isDark={isDark}
                            />

                            {/* Flip button */}
                            <TouchableOpacity
                                onPress={onFlip}
                                accessibilityLabel="Flip camera"
                                accessibilityRole="button"
                                style={styles.flipButton}
                            >
                                <Ionicons name="camera-reverse" size={22} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Status bar */}
                <View style={styles.statusBar}>
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: statusConfig.color },
                        ]}
                    />
                    <Text
                        style={[
                            styles.statusText,
                            { color: statusConfig.color },
                        ]}
                    >
                        {statusConfig.label}
                    </Text>
                </View>
            </View>
        </View>
    );
}
