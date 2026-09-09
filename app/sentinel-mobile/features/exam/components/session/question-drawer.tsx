import React from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import type { ThemeColors } from '@/types/exam';
import { isQuestionAnswered } from '@/features/exam/lib/mobile-exam-adapter';
import { resolveQuestionBadgeStyle } from '@/features/exam/lib/question-drawer-badge';
import { useDrawerAnimation } from '@/features/exam/hooks/use-drawer-animation';
import { styles } from './question-drawer.styles';
import { getDrawerLegendItems } from './question-drawer-legend';

export interface QuestionDrawerProps {
    visible: boolean;
    onClose: () => void;
    questions: any[];
    currentIndex: number;
    onSelectQuestion: (index: number) => void;
    answers: Record<string, any>;
    flaggedQuestions: Record<string, boolean>;
    colors: ThemeColors;
    isDark: boolean;
    bottomOffset: number;
}

export const QuestionDrawer = ({
    visible,
    onClose,
    questions,
    currentIndex,
    onSelectQuestion,
    answers,
    flaggedQuestions,
    colors,
    isDark,
    bottomOffset,
}: QuestionDrawerProps) => {
    const { height: screenHeight } = Dimensions.get('window');
    const { animatedStyle } = useDrawerAnimation({ visible, screenHeight });
    const legendItems = getDrawerLegendItems(colors);

    return (
        <Animated.View
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
                styles.drawerContainer,
                {
                    bottom: bottomOffset,
                    backgroundColor: colors.background,
                },
                animatedStyle,
            ]}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Question Navigator
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[
                            styles.closeButton,
                            { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' },
                        ]}
                    >
                        <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Horizontal Scroll List */}
                <View style={styles.scrollWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {questions.map((q, index) => {
                            const isCurrent = index === currentIndex;
                            const isAnswered = isQuestionAnswered(answers[q.id]);
                            const isFlagged = !!flaggedQuestions[q.id];

                            const badgeStyle = resolveQuestionBadgeStyle({
                                isCurrent,
                                isAnswered,
                                isFlagged,
                                colors,
                                isDark,
                            });

                            return (
                                <TouchableOpacity
                                    key={q.id}
                                    onPress={() => {
                                        onSelectQuestion(index);
                                        onClose();
                                    }}
                                    style={{
                                        ...styles.badge,
                                        backgroundColor: badgeStyle.bgColor,
                                        borderColor: badgeStyle.borderColor,
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            { color: badgeStyle.textColor },
                                            isCurrent && styles.badgeTextCurrent,
                                        ]}
                                    >
                                        {index + 1}
                                    </Text>

                                    {isFlagged && (
                                        <View
                                            style={[
                                                styles.flagBadge,
                                                {
                                                    backgroundColor: isDark ? '#78350f' : '#fef3c7',
                                                    borderColor: isDark ? '#000000' : '#ffffff',
                                                },
                                            ]}
                                        >
                                            <Ionicons name="flag" size={10} color="#f59e0b" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Legend */}
                <View
                    style={[
                        styles.legendContainer,
                        {
                            borderTopColor: colors.border,
                            backgroundColor: colors.card,
                        },
                    ]}
                >
                    <View style={styles.legendRow}>
                        {legendItems.map((item, index) => (
                            <View
                                key={item.key}
                                style={[
                                    styles.legendPill,
                                    index < legendItems.length - 1 && styles.legendPillMargin,
                                    {
                                        backgroundColor: isDark ? item.bgDark : item.bgLight,
                                    },
                                ]}
                            >
                                {item.icon}
                                <Text style={[styles.legendText, { color: colors.text }]}>
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

export { styles } from './question-drawer.styles';
