import { vi, describe, it, expect } from 'vitest';
import type { ThemeColors } from '@/types/exam';

vi.mock('react-native', () => ({
    View: 'View',
    StyleSheet: { create: (s: any) => s },
}));

vi.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));
import { getDrawerLegendItems } from './question-drawer-legend';

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

describe('getDrawerLegendItems', () => {
    it('returns all 3 legend items: Current, Answered, and Flagged', () => {
        const items = getDrawerLegendItems(mockColors);

        expect(items).toHaveLength(3);
        expect(items.map((i) => i.label)).toEqual(['Current', 'Answered', 'Flagged']);
        expect(items.map((i) => i.key)).toEqual(['current', 'answered', 'flagged']);
    });
});
