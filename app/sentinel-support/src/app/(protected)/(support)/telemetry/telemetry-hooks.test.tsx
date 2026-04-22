import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ApiProvider,
    AuthProvider,
    useTelemetrySettingsQuery,
    useUpdateTelemetrySettingsMutation,
} from '@sentinel/hooks';
import { DEFAULT_TELEMETRY_SETTINGS, TELEMETRY_QUERY_KEYS } from '@sentinel/shared';

const {
    mockGetTelemetrySettings,
    mockUpdateTelemetrySettings,
    mockToastSuccess,
    mockToastError,
} = vi.hoisted(() => ({
    mockGetTelemetrySettings: vi.fn(),
    mockUpdateTelemetrySettings: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
}));

vi.mock('@sentinel/services', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/services')>('@sentinel/services');

    return {
        ...actual,
        getTelemetrySettings: mockGetTelemetrySettings,
        updateTelemetrySettings: mockUpdateTelemetrySettings,
    };
});

vi.mock('sonner', () => ({
    toast: {
        success: mockToastSuccess,
        error: mockToastError,
    },
}));

function createSupabaseClientMock() {
    return {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: {
                    session: {
                        access_token: 'test-token',
                        user: {
                            id: 'support-user',
                        },
                    },
                },
            }),
            onAuthStateChange: vi.fn(() => ({
                data: {
                    subscription: {
                        unsubscribe: vi.fn(),
                    },
                },
            })),
        },
    } as any;
}

function createWrapper(queryClient: QueryClient, apiClient = vi.fn()) {
    const supabase = createSupabaseClientMock();

    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <AuthProvider supabase={supabase}>
                    <ApiProvider apiClient={apiClient}>{children}</ApiProvider>
                </AuthProvider>
            </QueryClientProvider>
        );
    };
}

const settingsRecord = {
    category: 'telemetry',
    key: 'telemetry.global.settings',
    description: 'Telemetry settings',
    updatedAt: '2026-04-22T00:00:00.000Z',
    updatedBy: 'Support Operator',
    value: DEFAULT_TELEMETRY_SETTINGS,
};

describe('Telemetry Hooks', () => {
    beforeEach(() => {
        mockGetTelemetrySettings.mockReset();
        mockUpdateTelemetrySettings.mockReset();
        mockToastSuccess.mockReset();
        mockToastError.mockReset();
    });

    it('fetches telemetry settings through the telemetry settings query hook', async () => {
        const apiClient = vi.fn();
        const queryClient = new QueryClient();
        mockGetTelemetrySettings.mockResolvedValue(settingsRecord);

        const { result } = renderHook(() => useTelemetrySettingsQuery(), {
            wrapper: createWrapper(queryClient, apiClient),
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockGetTelemetrySettings).toHaveBeenCalledWith(apiClient);
        expect(result.current.data).toMatchObject({
            updatedBy: 'Support Operator',
        });
    });

    it('updates telemetry settings and invalidates telemetry queries', async () => {
        const apiClient = vi.fn();
        const queryClient = new QueryClient();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        mockUpdateTelemetrySettings.mockResolvedValue({
            ...settingsRecord,
            value: {
                ...DEFAULT_TELEMETRY_SETTINGS,
                operations: {
                    ...DEFAULT_TELEMETRY_SETTINGS.operations,
                    enabled: false,
                },
            },
        });

        const { result } = renderHook(() => useUpdateTelemetrySettingsMutation(), {
            wrapper: createWrapper(queryClient, apiClient),
        });

        await act(async () => {
            result.current.mutate({
                ...DEFAULT_TELEMETRY_SETTINGS,
                operations: {
                    ...DEFAULT_TELEMETRY_SETTINGS.operations,
                    enabled: false,
                },
            });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockUpdateTelemetrySettings).toHaveBeenCalledWith(apiClient, {
            ...DEFAULT_TELEMETRY_SETTINGS,
            operations: {
                ...DEFAULT_TELEMETRY_SETTINGS.operations,
                enabled: false,
            },
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: TELEMETRY_QUERY_KEYS.all,
        });
    });
});
