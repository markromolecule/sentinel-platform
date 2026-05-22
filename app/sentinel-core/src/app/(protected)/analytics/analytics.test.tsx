import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import AnalyticsPage from './page';

// Mock ResizeObserver globally for JSDOM
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock Recharts ResponsiveContainer to prevent size calculation errors in JSDOM
vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal<typeof import('recharts')>();
    return {
        ...original,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="mock-responsive-container">{children}</div>
        ),
    };
});

// Mock UI elements that might use complex icons or sub-components
vi.mock('@sentinel/ui', async (importOriginal) => {
    const original = await importOriginal<typeof import('@sentinel/ui')>();
    return {
        ...original,
        PageHeader: ({ title, description }: any) => (
            <div data-testid="page-header">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        ),
    };
});

describe('Analytics Dashboard Page Route Smoke Test', () => {
    it('renders the header correctly with title and description', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('System Reports & Analytics').length).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText(
                'Real-time telemetry, session metrics, and integrity insights for the sentinel proctoring system.',
            ).length,
        ).toBeGreaterThanOrEqual(1);
    });

    it('renders key KPI cards correctly with labels and mocked values', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('Integrity Index').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Monitored Sessions').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Flagged Incidents').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Proctor Hours').length).toBeGreaterThanOrEqual(1);

        // Check values defined in our mock telemetry data
        expect(screen.getAllByText('94.2%').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('1,842').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('107').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('320h').length).toBeGreaterThanOrEqual(1);
    });

    it('renders visual chart cards successfully', () => {
        render(<AnalyticsPage />);
        expect(screen.getAllByText('Exam Completion Rates').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Incident Trends').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Incidents by Violation Type').length).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText('Department Integrity Distribution').length,
        ).toBeGreaterThanOrEqual(1);
    });
});
