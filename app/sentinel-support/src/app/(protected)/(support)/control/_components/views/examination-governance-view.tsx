'use client';

import {
    useAccessControlExaminationSettingsQuery,
    useUpdateAccessControlExaminationSettingsMutation,
} from '@sentinel/hooks';
import {
    AccessControlErrorState,
    AccessControlLoadingState,
    ExaminationSettingsForm,
} from '@/app/(protected)/(support)/control/_components';

export function ExaminationGovernanceView() {
    const { data, isLoading, error } = useAccessControlExaminationSettingsQuery();
    const updateMutation = useUpdateAccessControlExaminationSettingsMutation();

    if (isLoading) return <AccessControlLoadingState label="Loading examination defaults..." />;
    if (error) return <AccessControlErrorState message={error.message} />;

    return (
        <ExaminationSettingsForm
            record={data}
            isPending={updateMutation.isPending}
            onSubmit={(payload) => updateMutation.mutate(payload)}
        />
    );
}
