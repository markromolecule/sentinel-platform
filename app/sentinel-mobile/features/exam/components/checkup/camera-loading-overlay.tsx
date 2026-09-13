import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { type ThemeColors } from '@/types/exam';
import { styles } from './camera-preview.styles';

export interface CameraLoadingOverlayProps {
  isVisible: boolean;
  isBridgeLoading: boolean;
  colors: ThemeColors;
  isDark: boolean;
}

export function CameraLoadingOverlay({
  isVisible,
  isBridgeLoading,
  colors,
  isDark,
}: CameraLoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  const backdropBg = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';

  return (
    <View style={[styles.loadingOverlay, { backgroundColor: backdropBg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.icon }]}>
        {isBridgeLoading
          ? 'Initializing face detection…'
          : 'Initializing camera…'}
      </Text>
    </View>
  );
}
