import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { type ThemeColors } from '@/types/exam';
import { styles } from './camera-preview.styles';

export interface CameraCalibrationGuideProps {
  width: number;
  height: number;
  cameraError?: string | null;
  bridgeStatus?: 'initializing' | 'ready' | 'error';
  isFaceCentered?: boolean;
  calibrationFeedback?: string | null;
  calibrationProgress?: number;
  colors: ThemeColors;
}

export function CameraCalibrationGuide({
  width,
  height,
  cameraError,
  bridgeStatus,
  isFaceCentered = false,
  calibrationFeedback,
  calibrationProgress,
  colors,
}: CameraCalibrationGuideProps) {
  if (width <= 0 || height <= 0) {
    return null;
  }

  const isError = Boolean(cameraError || bridgeStatus === 'error');
  const strokeColor = isError
    ? '#ef4444'
    : isFaceCentered
      ? '#22c55e'
      : 'rgba(255, 255, 255, 0.4)';

  const feedbackText =
    cameraError ||
    calibrationFeedback ||
    (isFaceCentered ? 'Hold still...' : 'Align face in guide');

  const textColor = isError ? '#f87171' : '#fff';

  return (
    <View style={styles.guideContainer} pointerEvents="none">
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Ellipse
          cx={width * 0.5}
          cy={height * 0.45}
          rx={width * 0.22}
          ry={height * 0.32}
          stroke={strokeColor}
          strokeWidth={3}
          strokeDasharray="8 4"
          fill="transparent"
        />
      </Svg>

      {/* Status Pill Badge */}
      <View style={styles.guideStatusWrapper}>
        <View style={styles.guideStatusBadge}>
          <Text style={[styles.guideStatusText, { color: textColor }]}>
            {feedbackText}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {calibrationProgress !== undefined && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${calibrationProgress}%`,
                backgroundColor:
                  calibrationProgress === 100 ? '#22c55e' : colors.primary,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}
