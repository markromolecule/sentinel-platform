import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockUseTelemetrySettingsQuery,
    mockUseTelemetryHealthQuery,
    mockUseUpdateTelemetrySettingsMutation,
} = vi.hoisted(() => ({
    mockUseTelemetrySettingsQuery: vi.fn(),
    mockUseTelemetryHealthQuery: vi.fn(),
    mockUseUpdateTelemetrySettingsMutation: vi.fn(),
}));

vi.mock('@sentinel/hooks', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/hooks')>('@sentinel/hooks');

    return {
        ...actual,
        useTelemetrySettingsQuery: mockUseTelemetrySettingsQuery,
        useTelemetryHealthQuery: mockUseTelemetryHealthQuery,
        useUpdateTelemetrySettingsMutation: mockUseUpdateTelemetrySettingsMutation,
    };
});

import TelemetrySettingsPage from './page';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';

describe('TelemetrySettingsPage', () => {
    beforeEach(() => {
        mockUseTelemetryHealthQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        });
        mockUseUpdateTelemetrySettingsMutation.mockReturnValue({
            isPending: false,
            mutate: vi.fn(),
        });
    });

    it('shows the loading state while telemetry settings are being fetched', () => {
        mockUseTelemetrySettingsQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        });

        render(<TelemetrySettingsPage />);

        expect(screen.getByText(/loading telemetry settings/i)).toBeTruthy();
    });

    it('shows the error state when telemetry settings fail to load', () => {
        mockUseTelemetrySettingsQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Telemetry API failed'),
        });

        render(<TelemetrySettingsPage />);

        expect(screen.getByText(/unable to load telemetry settings/i)).toBeTruthy();
        expect(screen.getByText(/telemetry api failed/i)).toBeTruthy();
    });

    it('renders the telemetry settings workspace on successful load', () => {
        mockUseTelemetrySettingsQuery.mockReturnValue({
            data: {
                category: 'telemetry',
                key: 'telemetry.global.settings',
                description: 'Telemetry settings',
                updatedAt: '2026-04-22T00:00:00.000Z',
                updatedBy: 'Support Operator',
                value: DEFAULT_TELEMETRY_SETTINGS,
            },
            isLoading: false,
            error: null,
        });
        mockUseTelemetryHealthQuery.mockReturnValue({
            data: {
                status: 'ok',
                timestamp: '2026-04-22T00:00:00.000Z',
                ingestion: {
                    mode: 'sync',
                    queueName: null,
                    bufferName: null,
                },
            },
            isLoading: false,
            error: null,
        });

        render(<TelemetrySettingsPage />);

        expect(
            screen.getByRole('heading', {
                name: /telemetry settings/i,
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole('heading', {
                name: /global operations/i,
            }),
        ).toBeTruthy();
        expect(screen.getByText(/all synced/i)).toBeTruthy();
    });
});
