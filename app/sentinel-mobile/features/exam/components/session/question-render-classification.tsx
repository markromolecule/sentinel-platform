import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type {
    QuestionCardTheme,
    QuestionRenderLayoutSnapshot,
} from './inputs/question-card.types';

export interface QuestionRenderClassificationProps {
    colors: QuestionCardTheme;
    questionCount: number;
    currentIndex: number;
    hasCurrentQuestion: boolean;
    cardMounted: boolean;
    rootLayout?: QuestionRenderLayoutSnapshot | null;
    viewportLayout: QuestionRenderLayoutSnapshot | null;
    cardLayout: QuestionRenderLayoutSnapshot | null;
    topOffset?: number;
}

const formatLayout = (layout: QuestionRenderLayoutSnapshot | null | undefined) => {
    if (!layout) return 'pending';

    return `${layout.width}x${layout.height}`;
};

const hasNonZeroLayout = (layout: QuestionRenderLayoutSnapshot | null | undefined) => (
    Boolean(layout && layout.width > 0 && layout.height > 0)
);

export function QuestionRenderClassification({
    colors,
    questionCount,
    currentIndex,
    hasCurrentQuestion,
    cardMounted,
    rootLayout,
    viewportLayout,
    cardLayout,
    topOffset,
}: QuestionRenderClassificationProps) {
    if (!__DEV__ || process.env.EXPO_PUBLIC_SHOW_DEBUG_OVERLAY !== 'true') {
        return null;
    }

    const rootNonZero = hasNonZeroLayout(rootLayout);
    const viewportNonZero = hasNonZeroLayout(viewportLayout);
    const cardNonZero = hasNonZeroLayout(cardLayout);

    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                topOffset !== undefined && { top: topOffset },
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                },
            ]}
            accessibilityLabel="Question render classification"
        >
            <Text style={[styles.title, { color: colors.text }]}>
                Render classification
            </Text>
            <Text style={[styles.line, { color: colors.icon }]}>
                count={questionCount} index={currentIndex + 1}
            </Text>
            <Text style={[styles.line, { color: colors.icon }]}>
                current={hasCurrentQuestion ? 'yes' : 'no'} mounted={cardMounted ? 'yes' : 'no'}
            </Text>
            {rootLayout !== undefined && (
                <Text style={[styles.line, { color: colors.icon }]}>
                    root={formatLayout(rootLayout)} nonzero={rootNonZero ? 'yes' : 'no'}
                </Text>
            )}
            <Text style={[styles.line, { color: colors.icon }]}>
                viewport={formatLayout(viewportLayout)} nonzero={viewportNonZero ? 'yes' : 'no'}
            </Text>
            <Text style={[styles.line, { color: colors.icon }]}>
                card={formatLayout(cardLayout)} nonzero={cardNonZero ? 'yes' : 'no'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 12,
        top: 12,
        zIndex: 5,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        maxWidth: 240,
        opacity: 0.94,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    line: {
        fontSize: 11,
        lineHeight: 15,
    },
});
