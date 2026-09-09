import { describe, it, expect } from 'vitest';
import type { ThemeColors } from '@/types/exam';
import { resolveQuestionBadgeStyle } from './question-drawer-badge';

const mockColors: ThemeColors = {
    primary: '#6366f1',
    text: '#111827',
    input: '#f3f4f6',
    border: '#e5e7eb',
    background: '#ffffff',
    card: '#ffffff',
    icon: '#6b7280',
    tint: '#6366f1',
    tabIconDefault: '#687076',
    tabIconSelected: '#6366f1',
};

describe('resolveQuestionBadgeStyle', () => {
    it('returns default unselected colors when unanswered and not current', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: false,
            isAnswered: false,
            isFlagged: false,
            colors: mockColors,
            isDark: false,
        });

        expect(result).toEqual({
            bgColor: '#f3f4f6',
            borderColor: 'transparent',
            textColor: '#111827',
        });
    });

    it('returns primary themed colors for the current question in light mode', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: true,
            isAnswered: false,
            isFlagged: false,
            colors: mockColors,
            isDark: false,
        });

        expect(result).toEqual({
            bgColor: '#eef2ff',
            borderColor: '#6366f1',
            textColor: '#6366f1',
        });
    });

    it('returns dark themed colors for the current question in dark mode', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: true,
            isAnswered: false,
            isFlagged: false,
            colors: mockColors,
            isDark: true,
        });

        expect(result).toEqual({
            bgColor: '#1a1b2e',
            borderColor: '#6366f1',
            textColor: '#6366f1',
        });
    });

    it('returns green themed colors for answered questions in light mode', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: false,
            isAnswered: true,
            isFlagged: false,
            colors: mockColors,
            isDark: false,
        });

        expect(result).toEqual({
            bgColor: '#ecfdf5',
            borderColor: 'transparent',
            textColor: '#059669',
        });
    });

    it('returns dark green themed colors for answered questions in dark mode', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: false,
            isAnswered: true,
            isFlagged: false,
            colors: mockColors,
            isDark: true,
        });

        expect(result).toEqual({
            bgColor: '#064e3b',
            borderColor: 'transparent',
            textColor: '#34d399',
        });
    });

    it('overrides borderColor with amber (#f59e0b) when question is flagged', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: false,
            isAnswered: false,
            isFlagged: true,
            colors: mockColors,
            isDark: false,
        });

        expect(result.borderColor).toBe('#f59e0b');
    });

    it('keeps current background color but overrides border when current AND flagged', () => {
        const result = resolveQuestionBadgeStyle({
            isCurrent: true,
            isAnswered: false,
            isFlagged: true,
            colors: mockColors,
            isDark: false,
        });

        expect(result.bgColor).toBe('#eef2ff');
        expect(result.textColor).toBe('#6366f1');
        expect(result.borderColor).toBe('#f59e0b');
    });
});
