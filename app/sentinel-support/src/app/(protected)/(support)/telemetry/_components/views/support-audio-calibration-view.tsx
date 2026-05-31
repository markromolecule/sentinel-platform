'use client';

import { useAudioSettingsQuery, useUpdateAudioSettingsMutation } from '@sentinel/hooks';
import {
    AccessControlErrorState,
    AccessControlLoadingState,
} from '@/app/(protected)/(support)/control/_components';
import { AudioCalibrationForm } from '../audio/audio-calibration-form';

export function SupportAudioCalibrationView() {
    const { data, isLoading, error } = useAudioSettingsQuery();
    const updateMutation = useUpdateAudioSettingsMutation();

    if (isLoading)
        return <AccessControlLoadingState label="Loading audio calibration defaults..." />;
    if (error) return <AccessControlErrorState message={error.message} />;

    return (
        <AudioCalibrationForm
            record={data}
            isPending={updateMutation.isPending}
            onSubmit={(payload) => updateMutation.mutate(payload)}
        />
    );
}
