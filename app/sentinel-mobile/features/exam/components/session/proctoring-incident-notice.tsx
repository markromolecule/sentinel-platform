import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProctoringNotice } from '@/features/exam/hooks/monitoring';

export interface ProctoringIncidentNoticeProps {
    notice: ProctoringNotice | null;
    onDismiss: () => void;
}

export const ProctoringIncidentNotice: React.FC<ProctoringIncidentNoticeProps> = ({
    notice,
    onDismiss,
}) => {
    if (!notice) {
        return null;
    }

    const isAudio = notice.category === 'audio';
    const iconName = isAudio ? 'volume-medium-outline' : 'videocam-outline';

    return (
        <View
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            accessible={true}
            accessibilityLabel={`Notice: ${notice.message}`}
            style={styles.container}
            testID="proctoring-incident-notice"
        >
            <View style={styles.contentRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={18} color="#b45309" />
                </View>
                <Text style={styles.messageText} numberOfLines={2}>
                    {notice.message}
                </Text>
                <TouchableOpacity
                    onPress={onDismiss}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss notice"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.dismissButton}
                    testID="proctoring-incident-notice-dismiss"
                >
                    <Ionicons name="close" size={16} color="#78350f" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fef3c7',
        borderBottomWidth: 1,
        borderBottomColor: '#fde68a',
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: '100%',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        marginRight: 10,
    },
    messageText: {
        flex: 1,
        color: '#92400e',
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    dismissButton: {
        marginLeft: 10,
        padding: 4,
    },
});
