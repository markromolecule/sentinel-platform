'use client';

import {
    useAccessControlExaminationSettingsQuery,
    useUpdateAccessControlExaminationSettingsMutation,
} from '@sentinel/hooks';
import {
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
    ExaminationSettingsForm,
} from '@/app/(protected)/(support)/access-control/_components';

export default function AccessControlExaminationSettingsPage() {
    const { data, isLoading, error } = useAccessControlExaminationSettingsQuery();
    const updateMutation = useUpdateAccessControlExaminationSettingsMutation();

    return (
        <AccessControlPageShell
            title="Examination Global Settings"
            description="Tune the global examination baseline for access requirements, monitoring, and platform-specific protection defaults."
        >
            {isLoading ? (
                <AccessControlLoadingState label="Loading examination defaults..." />
            ) : error ? (
                <AccessControlErrorState message={error.message} />
            ) : (
                <ExaminationSettingsForm
                    record={data}
                    isPending={updateMutation.isPending}
                    onSubmit={(payload) => updateMutation.mutate(payload)}
                />
            )}
        </AccessControlPageShell>
    );
}
