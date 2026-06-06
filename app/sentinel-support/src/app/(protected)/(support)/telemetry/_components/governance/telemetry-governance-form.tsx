'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Button, cn } from '@sentinel/ui';
import { CircleDashed, Save, Undo2, AlertTriangle } from 'lucide-react';
import {
    useTelemetryHealthQuery,
    useTelemetrySettingsQuery,
    useUpdateTelemetrySettingsMutation,
} from '@sentinel/hooks';
import { useTelemetryDraft } from '../../_contexts/telemetry-draft-context';

import { TelemetryPageShell } from '../layout/telemetry-page-shell';
import { TelemetryWorkspaceShell } from '../layout/telemetry-workspace-shell';
import { type TelemetrySection } from '../layout/telemetry-nav';

import { OperationsView } from '../views/operations-view';
import { RulesView } from '../views/rules-view';
import { SupportAudioCalibrationView } from '../views/support-audio-calibration-view';
import { SandboxView } from '../views/sandbox-view';
import { HealthView } from '../views/health-view';

import { buildWarnings, cloneSettings } from '../shared/telemetry-utils';
import {
    AccessControlErrorState,
    AccessControlLoadingState,
} from '@/app/(protected)/(support)/control/_components';

const SECTION_METADATA: Record<TelemetrySection, { title: string; description: string }> = {
    health: {
        title: 'System Health',
        description: 'Monitor ingestion pipelines, buffer saturation, and collector connectivity.',
    },
    operations: {
        title: 'Operations',
        description:
            'Configure global runtime behavior, heartbeat frequency, and diagnostic levels.',
    },
    rules: {
        title: 'Rule Overrides',
        description: 'Manage specialized rule behaviors and posture overrides for the runtime.',
    },
    sandbox: {
        title: 'MediaPipe Sandbox',
        description: 'Control experimental MediaPipe integration and sandbox constraints.',
    },
    'audio-calibration': {
        title: 'Audio Anomaly Calibration',
        description: 'Configure global sensitivity, cooldown periods, and anomaly thresholds.',
    },
};

export function TelemetryGovernanceForm() {
    const pathname = usePathname();
    const router = useRouter();

    const { setDraft, currentDraft, isDirty, updateDraft } = useTelemetryDraft();

    const { isLoading, error } = useTelemetrySettingsQuery();
    const {
        data: health,
        isLoading: isHealthLoading,
        error: healthError,
    } = useTelemetryHealthQuery();
    const updateMutation = useUpdateTelemetrySettingsMutation();

    const warnings = useMemo(() => {
        if (!currentDraft || !health) return [];
        return buildWarnings(currentDraft, health);
    }, [currentDraft, health]);

    const activeSection = useMemo<TelemetrySection>(() => {
        if (pathname.endsWith('/rules')) return 'rules';
        if (pathname.endsWith('/sandbox')) return 'sandbox';
        if (pathname.endsWith('/health')) return 'health';
        if (pathname.endsWith('/audio-calibration')) return 'audio-calibration';
        return 'operations';
    }, [pathname]);

    const handleSectionChange = (section: TelemetrySection) => {
        const path = section === 'operations' ? '/telemetry' : `/telemetry/${section}`;
        router.push(path);
    };

    const updateSettingsAction = updateDraft;

    const handleSubmit = () => {
        updateMutation.mutate(cloneSettings(currentDraft));
    };

    const handleDiscard = () => setDraft(null);

    if (isLoading) {
        return <AccessControlLoadingState label="Loading telemetry runtime..." />;
    }

    if (error) {
        return <AccessControlErrorState title="Telemetry Load Failed" message={error.message} />;
    }

    const renderView = () => {
        switch (activeSection) {
            case 'health':
                return (
                    <HealthView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={updateMutation.isPending}
                        health={health}
                        isHealthLoading={isHealthLoading}
                        healthError={healthError ?? undefined}
                    />
                );
            case 'operations':
                return (
                    <OperationsView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={updateMutation.isPending}
                    />
                );
            case 'rules':
                return (
                    <RulesView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={updateMutation.isPending}
                    />
                );
            case 'sandbox':
                return (
                    <SandboxView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={updateMutation.isPending}
                    />
                );
            case 'audio-calibration':
                return <SupportAudioCalibrationView />;
            default:
                return null;
        }
    };

    const metadata = SECTION_METADATA[activeSection];

    const actions =
        activeSection === 'audio-calibration' ? null : (
            <div className="flex items-center gap-3">
                {isDirty && (
                    <Badge
                        variant="outline"
                        className="gap-1.5 border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-600 uppercase"
                    >
                        <AlertTriangle className="size-3" />
                        Unsaved Changes
                    </Badge>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDiscard}
                    disabled={!isDirty || updateMutation.isPending}
                    className="h-9 gap-2 text-xs font-semibold"
                >
                    <Undo2 className="size-4" />
                    Discard
                </Button>
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!isDirty || updateMutation.isPending}
                    className={cn(
                        'h-9 min-w-[120px] gap-2 shadow-sm',
                        isDirty &&
                            !updateMutation.isPending &&
                            'bg-[#323d8f] hover:bg-[#323d8f]/90',
                    )}
                >
                    {updateMutation.isPending ? (
                        <>
                            <CircleDashed className="size-4 animate-spin" />
                            <span>Syncing...</span>
                        </>
                    ) : (
                        <>
                            <Save className="size-4" />
                            <span>Sync Settings</span>
                        </>
                    )}
                </Button>
            </div>
        );

    return (
        <TelemetryWorkspaceShell
            activeSection={activeSection}
            onActiveSectionChange={handleSectionChange}
        >
            <TelemetryPageShell
                title={metadata.title}
                description={metadata.description}
                actions={actions}
            >
                <div className="flex flex-col gap-10">
                    {warnings.length > 0 && activeSection !== 'health' && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-amber-900">
                                        Active Runtime Warnings
                                    </h4>
                                    <ul className="space-y-2">
                                        {warnings.map((warning, i) => (
                                            <li
                                                key={i}
                                                className="text-xs leading-relaxed text-amber-800/80"
                                            >
                                                <strong>{warning.title}:</strong>{' '}
                                                {warning.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {renderView()}
                </div>
            </TelemetryPageShell>
        </TelemetryWorkspaceShell>
    );
}
