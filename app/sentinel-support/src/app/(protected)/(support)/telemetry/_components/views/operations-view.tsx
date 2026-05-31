import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, NativeSelect, NativeSelectOption } from '@sentinel/ui';
import type { ViewProps } from '../shared/telemetry-types';
import { ToggleRow } from '../shared/toggle-row';
import { LabeledField } from '../shared/labeled-field';

/**
 * Renders the Operations View dashboard, containing global ingestion/buffering toggle cards
 * and specific transport & batching tuning parameters.
 */
export function OperationsView({ currentDraft, updateSettingsAction, isPending }: ViewProps) {
    return (
        <section id="operations" className="scroll-mt-24 space-y-8 py-4">
            <Card className="w-full border-primary/10 overflow-hidden py-0">
                <CardHeader className="bg-muted/30 border-b py-5">
                    <CardTitle className="text-base">Global Ingestion & Flow Controls</CardTitle>
                    <CardDescription className="text-xs">
                        Configure global ingestion runtime flags and buffer pipeline switches.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border">
                    <ToggleRow
                        label="Telemetry Ingestion"
                        description="Stop persisting new events without changing the upstream client contract."
                        checked={currentDraft.operations.enabled}
                        onCheckedChange={(checked) =>
                            updateSettingsAction((settings) => ({
                                ...settings,
                                operations: { ...settings.operations, enabled: checked },
                            }))
                        }
                        disabled={isPending}
                        className="px-6 rounded-none"
                    />
                    <ToggleRow
                        label="Batching"
                        description="Allow the ingestion queue to buffer or chunk events instead of dispatching one-by-one."
                        checked={currentDraft.operations.batchingEnabled}
                        onCheckedChange={(checked) =>
                            updateSettingsAction((settings) => ({
                                ...settings,
                                operations: { ...settings.operations, batchingEnabled: checked },
                            }))
                        }
                        disabled={isPending}
                        className="px-6 rounded-none"
                    />
                </CardContent>
            </Card>

            <Card className="w-full border-primary/10 overflow-hidden py-0">
                <CardHeader className="bg-muted/30 border-b py-5">
                    <CardTitle className="text-base">Transport & Batching Parameters</CardTitle>
                    <CardDescription className="text-xs">
                        Adjust ingestion queue modes, deduplication windows, batch latency cadence, and maximum batch sizing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <LabeledField label="Ingestion mode" description="Preferred runtime transport.">
                            <NativeSelect
                                value={currentDraft.operations.ingestionMode}
                                onChange={(event) => {
                                    const value = event.currentTarget.value as 'sync' | 'redis';
                                    updateSettingsAction((settings) => ({
                                        ...settings,
                                        operations: {
                                            ...settings.operations,
                                            ingestionMode: value,
                                        },
                                    }));
                                }}
                                disabled={isPending}
                                className="h-10 text-xs"
                            >
                                <NativeSelectOption value="sync">Sync persistence</NativeSelectOption>
                                <NativeSelectOption value="redis">Redis queue</NativeSelectOption>
                            </NativeSelect>
                        </LabeledField>

                        <LabeledField
                            label="Dedupe window (s)"
                            description="Treat similar events as the same incident within this window."
                        >
                            <Input
                                type="number"
                                min={1}
                                max={3600}
                                step="1"
                                value={currentDraft.operations.dedupeWindowSeconds}
                                onChange={(event) => {
                                    const parsed = Number(event.currentTarget.value);
                                    if (!Number.isFinite(parsed)) return;
                                    updateSettingsAction((settings) => ({
                                        ...settings,
                                        operations: {
                                            ...settings.operations,
                                            dedupeWindowSeconds: parsed,
                                        },
                                    }));
                                }}
                                disabled={isPending}
                                className="h-10 text-xs"
                            />
                        </LabeledField>

                        <LabeledField
                            label="Batch window (ms)"
                            description="Delay dispatch to accumulate batches."
                        >
                            <Input
                                type="number"
                                min={100}
                                max={60000}
                                step="100"
                                value={currentDraft.operations.batchWindowMs}
                                onChange={(event) => {
                                    const parsed = Number(event.currentTarget.value);
                                    if (!Number.isFinite(parsed)) return;
                                    updateSettingsAction((settings) => ({
                                        ...settings,
                                        operations: {
                                            ...settings.operations,
                                            batchWindowMs: parsed,
                                        },
                                    }));
                                }}
                                disabled={isPending}
                                className="h-10 text-xs"
                            />
                        </LabeledField>

                        <LabeledField
                            label="Max batch size"
                            description="Split buffered groups once they hit this count."
                        >
                            <Input
                                type="number"
                                min={1}
                                max={500}
                                step="1"
                                value={currentDraft.operations.maxBatchSize}
                                onChange={(event) => {
                                    const parsed = Number(event.currentTarget.value);
                                    if (!Number.isFinite(parsed)) return;
                                    updateSettingsAction((settings) => ({
                                        ...settings,
                                        operations: {
                                            ...settings.operations,
                                            maxBatchSize: parsed,
                                        },
                                    }));
                                }}
                                disabled={isPending}
                                className="h-10 text-xs"
                            />
                        </LabeledField>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
