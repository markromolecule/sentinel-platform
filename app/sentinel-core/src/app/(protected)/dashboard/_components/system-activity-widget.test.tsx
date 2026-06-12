// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SystemActivityWidget } from './system-activity-widget';

afterEach(() => {
    cleanup();
});
import { MOCK_PLATFORM_ACTIVITY } from '@sentinel/shared/constants';

describe('SystemActivityWidget', () => {
    it('renders the title and description correctly', () => {
        render(<SystemActivityWidget />);
        expect(screen.getByText('Platform Activity')).toBeDefined();
        expect(
            screen.getByText('Latest actions and alerts across all institutions on the platform.'),
        ).toBeDefined();
    });

    it('renders activity rows from the mock data', () => {
        render(<SystemActivityWidget />);

        // Check first activity actor and action
        const firstActivity = MOCK_PLATFORM_ACTIVITY[0];
        expect(screen.getByText(firstActivity.actor)).toBeDefined();
        expect(screen.getByText(new RegExp(firstActivity.action))).toBeDefined();
        expect(screen.getAllByText(firstActivity.institutionName)).toBeDefined();
    });

    it('renders the "View All" link with correct href', () => {
        render(<SystemActivityWidget />);
        const link = screen.getByRole('link', { name: /view all/i });
        expect(link).toBeDefined();
        expect(link.getAttribute('href')).toBe('/logs');
    });
});
