// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import { AdminShortcutsWidget } from './admin-shortcuts-widget';

afterEach(() => {
    cleanup();
});


describe('AdminShortcutsWidget', () => {
    it('renders all shortcuts correctly with titles', () => {
        render(<AdminShortcutsWidget />);

        expect(screen.getByText('Quick Access')).toBeDefined();
        expect(screen.getByText('Exams Management')).toBeDefined();
        expect(screen.getByText('Question Bank')).toBeDefined();
        expect(screen.getByText('Enrollment Requests')).toBeDefined();
        expect(screen.getByText('Insights')).toBeDefined();
        expect(screen.getByText('Messages')).toBeDefined();
    });

    it('has valid href attributes for all shortcut links', () => {
        render(<AdminShortcutsWidget />);

        const examsLink = screen.getByRole('link', { name: /exams management/i });
        const questionBankLink = screen.getByRole('link', { name: /question bank/i });
        const requestsLink = screen.getByRole('link', { name: /enrollment requests/i });
        const reportsLink = screen.getByRole('link', { name: /insights/i });

        const messagesLink = screen.getByRole('link', { name: /messages/i });

        expect(examsLink.getAttribute('href')).toBe('/exams');
        expect(questionBankLink.getAttribute('href')).toBe('/question');
        expect(requestsLink.getAttribute('href')).toBe('/subjects/requests');
        expect(reportsLink.getAttribute('href')).toBe('/analytics');
        expect(messagesLink.getAttribute('href')).toBe('/messages');
    });
});
