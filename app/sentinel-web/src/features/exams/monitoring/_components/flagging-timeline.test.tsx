import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Flag } from '@sentinel/shared/types';
import { FlaggingTimeline } from './flagging-timeline';

describe('FlaggingTimeline', () => {
    it('surfaces the raw fullscreen trigger before the normalized incident bucket', () => {
        const flags: Flag[] = [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                type: 'TAB_SWITCH',
                rawEventType: 'FULL_SCREEN_EXIT',
                timestamp: '2026-04-23T14:07:40.000Z',
                description: 'Tab Switch Detected',
                severity: 'medium',
                occurrenceCount: 1,
            },
        ];

        render(<FlaggingTimeline flags={flags} />);

        expect(screen.getByText('Fullscreen Exit Detected')).toBeTruthy();
        expect(screen.getByText(/exited required fullscreen mode/i)).toBeTruthy();
        expect(screen.getByText(/normalized as tab switch detected/i)).toBeTruthy();
        expect(screen.getByText('Trigger FULL_SCREEN_EXIT')).toBeTruthy();
    });
});
