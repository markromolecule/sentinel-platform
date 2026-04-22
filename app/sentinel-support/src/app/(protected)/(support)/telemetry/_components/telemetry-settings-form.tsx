'use client';

import { useMemo, useState } from 'react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    cn,
} from '@sentinel/ui';
import { AlertTriangle, CircleDashed, Save } from 'lucide-react';
import type { TelemetrySettings } from '@sentinel/shared';
import type { TelemetrySettingsFormProps } from './shared/telemetry-types';
import {
    buildWarnings,
    cloneSettings,
    createTelemetrySettingsDraft,
} from './shared/telemetry-utils';
import { SettingsNav } from './shared/settings-nav';
import { OperationsView } from './views/operations-view';
import { RulesView } from './views/rules-view';
import { SandboxView } from './views/sandbox-view';
import { HealthView } from './views/health-view';

export function TelemetrySettingsForm({
    record,
    health,
    isHealthLoading,
    healthError,
    isPending,
    onSubmit,
}: TelemetrySettingsFormProps) {
    const [draft, setDraft] = useState<TelemetrySettings | null>(null);
    const [activeSection, setActiveSection] = useState('operations');

    const syncedDraft = useMemo(() => createTelemetrySettingsDraft(record), [record]);
    const currentDraft = draft ?? syncedDraft;

    const isDirty =
        JSON.stringify(cloneSettings(currentDraft)) !== JSON.stringify(cloneSettings(syncedDraft));

    const warnings = useMemo(() => buildWarnings(currentDraft, health), [currentDraft, health]);

    const updateSettingsAction = (updater: (settings: TelemetrySettings) => TelemetrySettings) =>
        setDraft((current) => updater(cloneSettings(current ?? syncedDraft)));

    const handleSubmit = () => onSubmit(cloneSettings(currentDraft));

    return (
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            <SettingsNav
                activeSection={activeSection}
                onActiveSectionChange={setActiveSection}
            />

            <div className="flex-1 space-y-12 pb-32">
                {/* Global Warnings - Always visible if they exist */}
                {warnings.length > 0 && (
                    <div className="space-y-3">
                        {warnings.map((warning) => (
                            <Alert
                                key={warning.title}
                                className="border-amber-500/20 bg-amber-500/5 py-4"
                            >
                                <AlertTriangle className="size-5 text-amber-500" />
                                <AlertTitle className="text-sm font-semibold ml-2 text-amber-600">
                                    {warning.title}
                                </AlertTitle>
                                <AlertDescription className="text-xs ml-2 leading-relaxed text-amber-700/80">
                                    {warning.description}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Conditional View Rendering */}
                {activeSection === 'operations' && (
                    <OperationsView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                    />
                )}

                {activeSection === 'rules' && (
                    <RulesView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                    />
                )}

                {activeSection === 'sandbox' && (
                    <SandboxView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                    />
                )}

                {activeSection === 'health' && (
                    <HealthView
                        currentDraft={currentDraft}
                        updateSettingsAction={updateSettingsAction}
                        isPending={isPending}
                        health={health}
                        isHealthLoading={isHealthLoading}
                        healthError={healthError}
                    />
                )}
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md px-6 py-4 lg:left-0">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Badge variant={isDirty ? 'default' : 'secondary'} className={cn(
                            "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            isDirty ? "bg-primary text-primary-foreground animate-pulse" : "opacity-60"
                        )}>
                            {isDirty ? 'Unsaved Changes' : 'All Synced'}
                        </Badge>
                        <p className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                            Runtime schema v{currentDraft.version} • Full-replace semantics applied on save.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDraft(null)}
                            disabled={!isDirty || isPending}
                            className="text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            Discard Changes
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!isDirty || isPending}
                            className={cn(
                                'min-w-[140px] gap-2 shadow-sm transition-all',
                                isDirty && !isPending && "shadow-primary/20",
                                isPending && 'pointer-events-none'
                            )}
                        >
                            {isPending ? (
                                <>
                                    <CircleDashed className="size-4 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Sync Settings</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
