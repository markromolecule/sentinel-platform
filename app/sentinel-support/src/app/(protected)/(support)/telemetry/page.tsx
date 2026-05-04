'use client';

import {
    useTelemetryHealthQuery,
    useTelemetrySettingsQuery,
    useUpdateTelemetrySettingsMutation,
} from '@sentinel/hooks';
import {
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
} from '@/app/(protected)/(support)/control/_components';
import { TelemetrySettingsForm } from '@/app/(protected)/(support)/telemetry/_components';

export default function TelemetrySettingsPage() {
    const { data, isLoading, error } = useTelemetrySettingsQuery();
    const {
        data: health,
        isLoading: isHealthLoading,
        error: healthError,
    } = useTelemetryHealthQuery();
    const updateMutation = useUpdateTelemetrySettingsMutation();

    return (
        <AccessControlPageShell
            title="Telemetry Settings"
            description="Control the global telemetry runtime, rule override posture, MediaPipe sandbox behavior, and ingestion health from one support workspace."
        >
            {isLoading ? (
                <AccessControlLoadingState label="Loading telemetry settings..." />
            ) : error ? (
                <AccessControlErrorState
                    title="Unable to load telemetry settings"
                    message={error.message}
                />
            ) : (
                <TelemetrySettingsForm
                    record={data}
                    health={health}
                    isHealthLoading={isHealthLoading}
                    healthError={healthError ?? undefined}
                    isPending={updateMutation.isPending}
                    onSubmit={(payload) => updateMutation.mutate(payload)}
                />
            )}
        </AccessControlPageShell>
    );
}
