import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { TelemetryDraftProvider } from './_contexts/telemetry-draft-context';
import TelemetryPage from './page';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const {
    mockUseTelemetrySettingsQuery,
    mockUseTelemetryHealthQuery,
    mockUseUpdateTelemetrySettingsMutation,
    mockUsePathname,
    mockUseRouter,
} = vi.hoisted(() => ({
    mockUseTelemetrySettingsQuery: vi.fn(),
    mockUseTelemetryHealthQuery: vi.fn(),
    mockUseUpdateTelemetrySettingsMutation: vi.fn(),
    mockUsePathname: vi.fn(),
    mockUseRouter: vi.fn(),
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

vi.mock('next/navigation', () => ({
    usePathname: mockUsePathname,
    useRouter: () => ({
        push: mockUseRouter,
    }),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TelemetryDraftProvider>{children}</TelemetryDraftProvider>
        </QueryClientProvider>
    );
}

describe('TelemetryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePathname.mockReturnValue('/telemetry');
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

    it('shows the loading state while telemetry runtime is being fetched', () => {
        mockUseTelemetrySettingsQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        });

        render(<TelemetryPage />, { wrapper: TestWrapper });

        expect(screen.getByText(/loading telemetry runtime/i)).toBeTruthy();
    });

    it('shows the error state when telemetry runtime fails to load', () => {
        mockUseTelemetrySettingsQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Telemetry API failed'),
        });

        render(<TelemetryPage />, { wrapper: TestWrapper });

        expect(screen.getByText(/telemetry load failed/i)).toBeTruthy();
        expect(screen.getByText(/telemetry api failed/i)).toBeTruthy();
    });

    it('renders the telemetry workspace shell on successful load', () => {
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

        render(<TelemetryPage />, { wrapper: TestWrapper });

        expect(screen.getByText(/telemetry runtime/i)).toBeTruthy();
        expect(screen.getByRole('heading', { name: /^operations$/i })).toBeTruthy();
        expect(screen.getByText(/sync settings/i)).toBeTruthy();
    });
});
