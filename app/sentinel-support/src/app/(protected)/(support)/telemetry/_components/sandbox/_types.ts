import type { TelemetrySettings } from '@sentinel/shared';
import type { UpdateSettingsCallback } from '../shared/telemetry-types';
import type { useMediaPipeSandbox } from '../../_hooks/use-mediapipe-sandbox';

export type SandboxComponentProps = {
    sandbox: TelemetrySettings['mediaPipeSandbox'];
    updateSettingsAction: UpdateSettingsCallback;
    isPending?: boolean;
};

export type SandboxStateProps = ReturnType<typeof useMediaPipeSandbox>;

export type SandboxHeaderProps = {
    sandbox: TelemetrySettings['mediaPipeSandbox'];
    phase: SandboxStateProps['phase'];
};

export type SandboxLauncherProps = SandboxComponentProps & {
    state: Pick<
        SandboxStateProps,
        | 'phase'
        | 'analysis'
        | 'isCalibrated'
        | 'lastUpdatedAt'
        | 'startSandbox'
    >;
    currentPreviewPayload: any; // Using any for now to avoid circular or complex shared types if not necessary, but better to use the specific type if available
    onLaunch: () => void;
};

export type SandboxWorkspaceDialogProps = SandboxComponentProps & {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    state: SandboxStateProps;
    previewCatalog: any[];
    currentPreviewPayload: any;
};
