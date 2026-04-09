'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Checkbox,
    Input,
    Switch,
} from '@sentinel/ui';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import type {
    ExaminationGlobalSettings,
    ExaminationGlobalSettingsRecord,
} from '@sentinel/shared/types';
import { AccessControlSection } from './access-control-section';

const BASE_DEVICE_OPTIONS = ['desktop', 'laptop', 'tablet', 'mobile'];

function createDefaultSettingsDraft(): ExaminationGlobalSettings {
    return {
        ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        defaultAllowedDevices: [...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAllowedDevices],
    };
}

type ExaminationSettingsFormProps = {
    record?: ExaminationGlobalSettingsRecord;
    isPending?: boolean;
    onSubmit: (payload: ExaminationGlobalSettings) => void;
};

export function ExaminationSettingsForm({
    record,
    isPending,
    onSubmit,
}: ExaminationSettingsFormProps) {
    const [draft, setDraft] = useState<ExaminationGlobalSettings>(createDefaultSettingsDraft);
    const [deviceInput, setDeviceInput] = useState('');

    useEffect(() => {
        if (!record) return;
        setDraft(record.value);
        setDeviceInput('');
    }, [record]);

    const availableDevices = useMemo(
        () => Array.from(new Set([...BASE_DEVICE_OPTIONS, ...draft.defaultAllowedDevices])).sort(),
        [draft.defaultAllowedDevices],
    );

    const updateField = <K extends keyof ExaminationGlobalSettings>(
        key: K,
        value: ExaminationGlobalSettings[K],
    ) => setDraft((current) => ({ ...current, [key]: value }));

    const toggleDevice = (device: string, checked: boolean) => {
        setDraft((current) => ({
            ...current,
            defaultAllowedDevices: checked
                ? Array.from(new Set([...current.defaultAllowedDevices, device]))
                : current.defaultAllowedDevices.filter((item) => item !== device),
        }));
    };

    const addCustomDevice = () => {
        const normalized = deviceInput.trim().toLowerCase();
        if (!normalized) return;
        toggleDevice(normalized, true);
        setDeviceInput('');
    };

    return (
        <div className="grid gap-4">
            <AccessControlSection
                title="Timing and scoring"
                description="Set the baseline exam duration, passing score, reconnect tolerance, and submit timing."
                actions={
                    record ? (
                        <div className="text-muted-foreground text-right text-xs">
                            <div>{record.category}</div>
                            <div>{record.key}</div>
                        </div>
                    ) : null
                }
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="space-y-2">
                        <span className="text-sm font-medium">Duration (minutes)</span>
                        <Input
                            type="number"
                            min={1}
                            value={draft.defaultDurationMinutes}
                            onChange={(event) =>
                                updateField('defaultDurationMinutes', Number(event.target.value) || 0)
                            }
                            disabled={isPending}
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium">Passing score (%)</span>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={draft.defaultPassingScore}
                            onChange={(event) =>
                                updateField('defaultPassingScore', Number(event.target.value) || 0)
                            }
                            disabled={isPending}
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium">Reconnect attempts</span>
                        <Input
                            type="number"
                            min={0}
                            value={draft.defaultMaxReconnectAttempts}
                            onChange={(event) =>
                                updateField(
                                    'defaultMaxReconnectAttempts',
                                    Number(event.target.value) || 0,
                                )
                            }
                            disabled={isPending}
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium">Auto-submit timeout (minutes)</span>
                        <Input
                            type="number"
                            min={0}
                            value={draft.defaultAutoSubmitTimeoutMinutes}
                            onChange={(event) =>
                                updateField(
                                    'defaultAutoSubmitTimeoutMinutes',
                                    Number(event.target.value) || 0,
                                )
                            }
                            disabled={isPending}
                        />
                    </label>
                </div>
            </AccessControlSection>

            <AccessControlSection
                title="Exam behavior"
                description="Decide how default attempts should behave for review, answer visibility, and item randomization."
            >
                <div className="grid gap-3 md:grid-cols-2">
                    {[
                        ['Shuffle questions', 'defaultShuffleQuestions'],
                        ['Show correct answers', 'defaultShowCorrectAnswers'],
                        ['Allow review', 'defaultAllowReview'],
                        ['Randomize choices', 'defaultRandomizeChoices'],
                        ['Strict mode', 'defaultStrictMode'],
                        ['Screen lock', 'defaultScreenLock'],
                        ['Camera required', 'defaultCameraRequired'],
                        ['Microphone required', 'defaultMicRequired'],
                    ].map(([label, key]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded-lg border px-3 py-3"
                        >
                            <div className="space-y-1">
                                <div className="font-medium">{label}</div>
                                <p className="text-muted-foreground text-sm">
                                    {draft[key as keyof ExaminationGlobalSettings] ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                            <Switch
                                checked={Boolean(draft[key as keyof ExaminationGlobalSettings])}
                                onCheckedChange={(checked) =>
                                    updateField(
                                        key as keyof ExaminationGlobalSettings,
                                        checked as never,
                                    )
                                }
                                disabled={isPending}
                            />
                        </div>
                    ))}
                </div>
            </AccessControlSection>

            <AccessControlSection
                title="Allowed devices"
                description="Choose which device labels support can allow by default, and add custom device tags when needed."
                actions={
                    <div className="flex items-center gap-2">
                        <Input
                            value={deviceInput}
                            onChange={(event) => setDeviceInput(event.target.value)}
                            placeholder="Add device label"
                            className="w-40"
                            disabled={isPending}
                        />
                        <Button variant="outline" onClick={addCustomDevice} disabled={isPending}>
                            Add device
                        </Button>
                    </div>
                }
            >
                <div className="grid gap-3 md:grid-cols-2">
                    {availableDevices.map((device) => (
                        <label
                            key={device}
                            className="flex items-center justify-between rounded-lg border px-3 py-3"
                        >
                            <div>
                                <div className="font-medium capitalize">{device}</div>
                                <p className="text-muted-foreground text-sm">
                                    Included in the baseline device policy.
                                </p>
                            </div>
                            <Checkbox
                                checked={draft.defaultAllowedDevices.includes(device)}
                                onCheckedChange={(checked) => toggleDevice(device, checked === true)}
                                disabled={isPending}
                            />
                        </label>
                    ))}
                </div>
            </AccessControlSection>

            <div className="flex flex-col gap-3 rounded-xl border bg-background px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-muted-foreground text-sm">
                    {record?.updatedAt
                        ? `Last updated ${new Date(record.updatedAt).toLocaleString()}`
                        : 'These defaults will be saved as the global examination baseline.'}
                </div>
                <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDraft(record?.value ?? createDefaultSettingsDraft())}
                            disabled={isPending}
                        >
                            Reset
                        </Button>
                    <Button onClick={() => onSubmit(draft)} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save defaults'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
