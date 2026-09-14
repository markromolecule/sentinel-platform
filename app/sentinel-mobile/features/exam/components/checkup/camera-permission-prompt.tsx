import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type ThemeColors } from '@/types/exam';
import { styles } from './camera-preview.styles';

export interface CameraPermissionPromptProps {
  isPermissionLoading: boolean;
  onRequestPermission?: () => void;
  colors: ThemeColors;
  isDark: boolean;
}

export function CameraPermissionPrompt({
  isPermissionLoading,
  onRequestPermission,
  colors,
  isDark,
}: CameraPermissionPromptProps) {
  if (isPermissionLoading) {
    return (
      <View style={styles.permissionLoadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.permissionLoadingText, { color: colors.icon }]}>
          Checking camera permissions…
        </Text>
      </View>
    );
  }

  const promptBg = isDark ? 'rgba(0,0,0,0.3)' : 'rgba(240,240,240,0.5)';

  return (
    <View style={[styles.permissionPromptContainer, { backgroundColor: promptBg }]}>
      <View
        style={[
          styles.permissionIconWrapper,
          { backgroundColor: colors.primary + '18' },
        ]}
      >
        <Ionicons name="camera-outline" size={28} color={colors.primary} />
      </View>
      <Text style={[styles.permissionTitle, { color: colors.text }]}>
        Camera Access Required
      </Text>
      <Text style={[styles.permissionSubtitle, { color: colors.icon }]}>
        Please grant camera permission to verify your environment for this exam.
      </Text>
      {onRequestPermission ? (
        <TouchableOpacity
          onPress={onRequestPermission}
          style={[styles.permissionButton, { backgroundColor: colors.primary }]}
          accessibilityLabel="Grant camera permission"
          accessibilityRole="button"
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
