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
            description="Support can now tune the default examination baseline directly, without stopping at a read-only summary."
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
