import type { ThemeColors } from '@/types/exam';

export interface QuestionBadgeStyleOptions {
    isCurrent: boolean;
    isAnswered: boolean;
    isFlagged: boolean;
    colors: ThemeColors;
    isDark: boolean;
}

export interface QuestionBadgeStyleResult {
    bgColor: string;
    borderColor: string;
    textColor: string;
}

/**
 * Computes background, border, and text colors for a question drawer badge
 * based on whether it is current, answered, and/or flagged in light or dark theme.
 */
export function resolveQuestionBadgeStyle({
    isCurrent,
    isAnswered,
    isFlagged,
    colors,
    isDark,
}: QuestionBadgeStyleOptions): QuestionBadgeStyleResult {
    let bgColor = colors.input;
    let borderColor = 'transparent';
    let textColor = colors.text;

    if (isCurrent) {
        borderColor = colors.primary;
        bgColor = isDark ? '#1a1b2e' : '#eef2ff';
        textColor = colors.primary;
    } else if (isAnswered) {
        bgColor = isDark ? '#064e3b' : '#ecfdf5';
        textColor = isDark ? '#34d399' : '#059669';
    }

    if (isFlagged) {
        borderColor = '#f59e0b';
    }

    return { bgColor, borderColor, textColor };
}
