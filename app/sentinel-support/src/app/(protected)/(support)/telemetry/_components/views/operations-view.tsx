import { Input, NativeSelect, NativeSelectOption } from '@sentinel/ui';
import type { ViewProps } from '../shared/telemetry-types';
import { ToggleRow } from '../shared/toggle-row';
import { LabeledField } from '../shared/labeled-field';

export function OperationsView({ currentDraft, updateSettingsAction, isPending }: ViewProps) {
    return (
        <section id="operations" className="scroll-mt-24 space-y-8 py-4">
            {/* Global switches */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">Global Operations</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Kill switch and batching behavior for newly persisted telemetry events.
                    </p>
                </div>
                <div className="bg-card/50 divide-y rounded-xl border px-4">
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
                    />
                </div>
            </div>

            {/* Numeric controls */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">Transport & Batching</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Ingestion mode, deduplication window, and batch sizing controls.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <LabeledField label="Ingestion mode" description="Preferred runtime transport.">
                        <NativeSelect
                            value={currentDraft.operations.ingestionMode}
                            onChange={(event) =>
                                updateSettingsAction((settings) => ({
                                    ...settings,
                                    operations: {
                                        ...settings.operations,
                                        ingestionMode: event.currentTarget.value as
                                            | 'sync'
                                            | 'redis',
                                    },
                                }))
                            }
                            disabled={isPending}
                            className="h-10"
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
                            className="h-10"
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
                            className="h-10"
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
                            className="h-10"
                        />
                    </LabeledField>
                </div>
            </div>
        </section>
    );
}
