import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import type { MobileMediaPipeBridgeRef } from '../checkup/mobile-mediapipe-bridge';
import { useMobileLiveInspection } from '../../hooks/use-mobile-live-inspection';

export type MobileLiveInspectionBridgeProps = {
    sessionId: string | null;
    attemptId?: string | null;
    enabled: boolean;
    mediaPipeRef?: React.RefObject<MobileMediaPipeBridgeRef | null>;
    getLiveVideoTrack?: () => any;
};

/**
 * MobileLiveInspectionBridge connects the mobile exam camera stream to the proctoring network
 * via LiveKit embedded in the MediaPipe WebView, displaying a subtle overlay indicator when being viewed live.
 */
export function MobileLiveInspectionBridge({
    sessionId,
    attemptId,
    enabled,
    mediaPipeRef,
    getLiveVideoTrack,
}: MobileLiveInspectionBridgeProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const { isLive } = useMobileLiveInspection({
        sessionId,
        attemptId,
        enabled,
        mediaPipeRef,
        getLiveVideoTrack,
    });

    if (!isLive) {
        return null;
    }

    return (
        <View
            accessibilityLabel="Live inspection indicator"
            accessibilityRole="alert"
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: colors.border,
                },
            ]}
        >
            <Ionicons name="eye" size={16} color="#10b981" style={styles.icon} />
            <Text
                style={[
                    styles.text,
                    {
                        color: colors.text,
                    },
                ]}
            >
                Camera being viewed live by authorized proctor
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 999,
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
