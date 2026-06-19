import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SupportShortcutsWidget } from './support-shortcuts-widget';

describe('SupportShortcutsWidget', () => {
    it('renders all shortcuts correctly with titles', () => {
        render(<SupportShortcutsWidget />);

        expect(screen.getByText('Quick Access')).toBeDefined();
        expect(screen.getByText('Institutions')).toBeDefined();
        expect(screen.getByText('Identity & Access')).toBeDefined();
        expect(screen.getByText('Telemetry Monitor')).toBeDefined();
        expect(screen.getByText('System Logs')).toBeDefined();
        expect(screen.getByText('Announcements')).toBeDefined();
        expect(screen.getByText('Messages')).toBeDefined();
    });

    it('has valid href attributes for all shortcut links', () => {
        render(<SupportShortcutsWidget />);

        const institutionsLink = screen.getByRole('link', { name: /institutions/i });
        const usersLink = screen.getByRole('link', { name: /identity & access/i });
        const telemetryLink = screen.getByRole('link', { name: /telemetry monitor/i });

        expect(institutionsLink.getAttribute('href')).toBe('/institutions');
        expect(usersLink.getAttribute('href')).toBe('/users');
        expect(telemetryLink.getAttribute('href')).toBe('/telemetry');
    });
});
