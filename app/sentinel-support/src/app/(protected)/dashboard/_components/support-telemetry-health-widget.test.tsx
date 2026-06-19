import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SupportTelemetryHealthWidget } from './support-telemetry-health-widget';

const mockRefetch = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useTelemetryHealthQuery: vi.fn(),
}));

import { useTelemetryHealthQuery } from '@sentinel/hooks';
const mockUseTelemetryHealthQuery = vi.mocked(useTelemetryHealthQuery);

describe('SupportTelemetryHealthWidget', () => {
    it('renders loading spinner when loading', () => {
        mockUseTelemetryHealthQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isRefetching: false,
            refetch: mockRefetch,
        } as any);

        render(<SupportTelemetryHealthWidget />);
        expect(screen.getByText('Loading metrics...')).toBeDefined();
    });

    it('renders health data when available', () => {
        mockUseTelemetryHealthQuery.mockReturnValue({
            data: {
                status: 'HEALTHY',
                timestamp: '2026-06-20T00:00:00Z',
                ingestion: {
                    mode: 'stream',
                    queueName: 'telemetry-queue',
                    active: 3,
                    waiting: 12,
                    completed: 1450,
                    failed: 2,
                    buffered: 5,
                    bufferName: 'redis-buffer',
                },
            },
            isLoading: false,
            isRefetching: false,
            refetch: mockRefetch,
        } as any);

        render(<SupportTelemetryHealthWidget />);

        expect(screen.getByText('Telemetry Health')).toBeDefined();
        expect(screen.getByText('HEALTHY')).toBeDefined();
        expect(screen.getByText('stream')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined(); // active
        expect(screen.getByText('12')).toBeDefined(); // waiting
        expect(screen.getByText('1450')).toBeDefined(); // completed
        expect(screen.getByText('2')).toBeDefined(); // failed
        expect(screen.getByText('redis-buffer')).toBeDefined();
    });

    it('triggers refetch when refresh button is clicked', () => {
        mockUseTelemetryHealthQuery.mockReturnValue({
            data: {
                status: 'HEALTHY',
                ingestion: {
                    mode: 'stream',
                },
            },
            isLoading: false,
            isRefetching: false,
            refetch: mockRefetch,
        } as any);

        render(<SupportTelemetryHealthWidget />);

        const refreshButton = screen.getByRole('button', { name: /refresh telemetry health/i });
        fireEvent.click(refreshButton);

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
});
