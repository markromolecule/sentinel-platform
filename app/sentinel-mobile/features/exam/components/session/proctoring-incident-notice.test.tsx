import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { create, act } from 'react-test-renderer';
import { ProctoringIncidentNotice } from './proctoring-incident-notice';
import type { ProctoringNotice } from '@/features/exam/hooks/monitoring';

vi.mock('react-native', () => ({
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
        create: <T extends Record<string, unknown>>(styles: T) => styles,
    },
}));

vi.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('ProctoringIncidentNotice', () => {
    it('renders null when notice is null', () => {
        let tree: any;
        act(() => {
            tree = create(<ProctoringIncidentNotice notice={null} onDismiss={vi.fn()} />);
        });
        expect(tree.toJSON()).toBeNull();
    });

    it('renders audio notice message and dismiss button', () => {
        const notice: ProctoringNotice = {
            id: 'notice-audio-1',
            category: 'audio',
            message: 'Speaking detected. Please maintain silence during the exam.',
            timestamp: Date.now(),
        };
        const onDismiss = vi.fn();

        let tree: any;
        act(() => {
            tree = create(<ProctoringIncidentNotice notice={notice} onDismiss={onDismiss} />);
        });

        const root = tree.root;
        const textInstances = root.findAllByType('Text');
        const hasText = textInstances.some(
            (t: any) => t.props.children === notice.message,
        );
        expect(hasText).toBe(true);

        const dismissBtn = root.findByProps({ testID: 'proctoring-incident-notice-dismiss' });
        expect(dismissBtn).toBeDefined();

        act(() => {
            dismissBtn.props.onPress();
        });
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders video notice message with accessibility attributes', () => {
        const notice: ProctoringNotice = {
            id: 'notice-video-1',
            category: 'video',
            message: 'Looking away from screen. Please stay focused on your exam.',
            timestamp: Date.now(),
        };

        let tree: any;
        act(() => {
            tree = create(<ProctoringIncidentNotice notice={notice} onDismiss={vi.fn()} />);
        });

        const root = tree.root;
        const noticeContainer = root.findByProps({ testID: 'proctoring-incident-notice' });
        expect(noticeContainer.props.accessibilityRole).toBe('alert');
        expect(noticeContainer.props.accessibilityLabel).toBe(`Notice: ${notice.message}`);
    });
});
