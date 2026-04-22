'use client';

import { useMemo, useState } from 'react';
import { Button } from '@sentinel/ui';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type {
    ExaminationGlobalSettings,
    ExaminationGlobalSettingsRecord,
} from '@sentinel/shared/types';

import { StatusStrip } from '@/app/(protected)/(support)/telemetry/_components/shared/status-strip';
import { ExaminationSettingsNav, type ExaminationSettingsSection } from './examination-views/examination-settings-nav';
import { GeneralSettingsView } from './examination-views/general-settings-view';
import { BehaviorSettingsView } from './examination-views/behavior-settings-view';
import { SafeguardsView } from './examination-views/safeguards-view';
import { MonitoringView } from './examination-views/monitoring-view';

function createDefaultSettingsDraft(): ExaminationGlobalSettings {
    return {
        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        defaultAiRules: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules },
        defaultWebSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity },
        defaultMobileSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity },
    };
}

type ExaminationSettingsFormProps = {
    record?: ExaminationGlobalSettingsRecord;
    isPending?: boolean;
    onSubmit: (payload: ExaminationGlobalSettings) => void;
};

type NestedRuleSection = 'defaultAiRules' | 'defaultWebSecurity' | 'defaultMobileSecurity';

export function ExaminationSettingsForm({
    record,
    isPending,
    onSubmit,
}: ExaminationSettingsFormProps) {
    const [draft, setDraft] = useState<ExaminationGlobalSettings | null>(null);
    const [activeSection, setActiveSection] = useState<ExaminationSettingsSection>('overview');

    const syncedDraft = useMemo<ExaminationGlobalSettings>(() => {
        if (!record) return createDefaultSettingsDraft();

        return {
            ...record.value,
            defaultAiRules: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules,
                ...record.value.defaultAiRules,
            },
            defaultWebSecurity: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity,
                ...record.value.defaultWebSecurity,
            },
            defaultMobileSecurity: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity,
                ...record.value.defaultMobileSecurity,
            },
        };
    }, [record]);

    const currentDraft = draft ?? syncedDraft;
    const isDirty = Boolean(draft);

    const updateField = <K extends keyof ExaminationGlobalSettings>(
        key: K,
        value: ExaminationGlobalSettings[K],
    ) =>
        setDraft((current) => {
            const base = current ?? syncedDraft;
            return { ...base, [key]: value };
        });

    const updateNestedField = <
        TSection extends NestedRuleSection,
        TKey extends keyof ExaminationGlobalSettings[TSection],
    >(
        section: TSection,
        key: TKey,
        value: ExaminationGlobalSettings[TSection][TKey],
    ) =>
        setDraft((current) => ({
            ...(current ?? syncedDraft),
            [section]: {
                ...(current ?? syncedDraft)[section],
                [key]: value,
            },
        }));

    const metrics = useMemo(() => {
        const aiCount = Object.values(currentDraft.defaultAiRules).filter(Boolean).length;
        const webCount = Object.values(currentDraft.defaultWebSecurity).filter(Boolean).length;
        const mobileCount = Object.values(currentDraft.defaultMobileSecurity).filter(Boolean).length;

        return [
            {
                label: 'Baseline Duration',
                value: `${currentDraft.defaultDurationMinutes}m`,
                hint: 'Default attempt window',
            },
            {
                label: 'Security Tier',
                value: currentDraft.defaultStrictMode ? 'Strict' : 'Flexible',
                hint: `Rules: ${webCount}W / ${mobileCount}M`,
            },
            {
                label: 'AI Monitoring',
                value: aiCount > 0 ? 'Enhanced' : 'Baseline',
                hint: `${aiCount} active signals`,
            },
            {
                label: 'Fault Tolerance',
                value: `${currentDraft.defaultMaxReconnectAttempts} Tries`,
                hint: 'Reconnect allowance',
            },
        ];
    }, [currentDraft]);

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                                Governance Overview
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs font-medium">
                                Current baseline health for all platform-wide examination defaults.
                            </p>
                        </div>
                        <StatusStrip items={metrics} />

                        <div className="rounded-2xl border bg-primary/5 p-8 text-center border-primary/10">
                            <h3 className="text-sm font-bold text-primary/80 uppercase tracking-widest">Platform Integrity</h3>
                            <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-muted-foreground italic">
                                These settings define the &quot;safe zone&quot; for all newly created exams.
                                Changes here impact the global posture but can be overridden at the exam level.
                            </p>
                        </div>
                    </div>
                );
            case 'general':
                return <GeneralSettingsView draft={currentDraft} isPending={!!isPending} updateField={updateField} />;
            case 'behavior':
                return <BehaviorSettingsView draft={currentDraft} isPending={!!isPending} updateField={updateField} />;
            case 'safeguards':
                return <SafeguardsView draft={currentDraft} isPending={!!isPending} updateNestedField={updateNestedField} />;
            case 'monitoring':
                return <MonitoringView draft={currentDraft} isPending={!!isPending} updateNestedField={updateNestedField} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            <div className="sticky top-40 hidden lg:block border-r border-border/40 pr-8">
                <ExaminationSettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>

            <div className="lg:hidden">
                <ExaminationSettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>

            <div className="min-w-0 flex-1">
                {renderContent()}

                {/* Footer Actions */}
                <div className="sticky bottom-6 z-10 mt-20">
                    <div className="bg-background/95 flex flex-col gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-md md:flex-row md:items-center md:justify-between border-primary/10">
                        <div className="space-y-1">
                            <div className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight">
                                {isDirty ? 'Modification in Progress' : 'Governance Baseline Synced'}
                            </div>
                            <div className="text-muted-foreground text-[10px] font-medium opacity-60 italic">
                                {record?.updatedAt
                                    ? `Registry last updated ${new Date(record.updatedAt).toLocaleString()}`
                                    : 'Awaiting first baseline synchronization.'}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDraft(null)}
                                disabled={isPending || !isDirty}
                                className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest"
                            >
                                Discard Changes
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onSubmit(currentDraft)}
                                disabled={isPending || !isDirty}
                                className="h-9 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                {isPending ? 'Syncing...' : 'Update Baseline'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
