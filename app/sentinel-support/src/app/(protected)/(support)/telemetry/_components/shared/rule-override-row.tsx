'use client';

import { Badge, Input, NativeSelect, NativeSelectOption } from '@sentinel/ui';
import { TELEMETRY_INCIDENT_SEVERITIES } from '@sentinel/shared';
import type { TelemetryIncidentSeverity, TelemetryRuleOverride } from '@sentinel/shared';
import type { RuleDefinition } from './telemetry-types';

type RuleOverrideRowProps = {
    definition: RuleDefinition;
    override: TelemetryRuleOverride;
    disabled?: boolean;
    onEnabledChange: (value: '' | 'true' | 'false') => void;
    onSeverityChange: (value: '' | TelemetryIncidentSeverity) => void;
    onConfidenceChange: (value: string) => void;
    onDurationChange: (value: string) => void;
    onRepeatChange: (value: string) => void;
};

function OverrideBadge({ override }: { override: TelemetryRuleOverride }) {
    const count = Object.keys(override).length;
    return (
        <Badge variant={count > 0 ? 'default' : 'outline'} className="shrink-0 text-[10px]">
            {count > 0 ? `${count} override${count > 1 ? 's' : ''}` : 'Inherit'}
        </Badge>
    );
}

export function RuleOverrideRow({
    definition,
    override,
    disabled,
    onEnabledChange,
    onSeverityChange,
    onConfidenceChange,
    onDurationChange,
    onRepeatChange,
}: RuleOverrideRowProps) {
    const hasThresholds =
        definition.supportsConfidence || definition.supportsDuration || definition.supportsRepeat;

    return (
        <div className="grid gap-3 py-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium leading-tight">
                            {definition.label}
                        </span>
                        <OverrideBadge override={override} />
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-tight">
                        {definition.description}
                    </p>
                </div>
            </div>

            {/* Controls row */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <NativeSelect
                    value={
                        override.enabled === undefined
                            ? ''
                            : override.enabled
                                ? 'true'
                                : 'false'
                    }
                    onChange={(event) =>
                        onEnabledChange(event.currentTarget.value as '' | 'true' | 'false')
                    }
                    disabled={disabled}
                    aria-label={`${definition.label} — runtime enablement`}
                >
                    <NativeSelectOption value="">Inherit config</NativeSelectOption>
                    <NativeSelectOption value="true">Force enabled</NativeSelectOption>
                    <NativeSelectOption value="false">Disable globally</NativeSelectOption>
                </NativeSelect>

                <NativeSelect
                    value={override.severity ?? ''}
                    onChange={(event) =>
                        onSeverityChange(
                            event.currentTarget.value as '' | TelemetryIncidentSeverity,
                        )
                    }
                    disabled={disabled}
                    aria-label={`${definition.label} — severity override`}
                >
                    <NativeSelectOption value="">Inherit severity</NativeSelectOption>
                    {TELEMETRY_INCIDENT_SEVERITIES.map((severity) => (
                        <NativeSelectOption key={severity} value={severity}>
                            {severity}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>

                {hasThresholds ? (
                    <>
                        {definition.supportsConfidence ? (
                            <Input
                                type="number"
                                min={0}
                                max={1}
                                step="0.01"
                                placeholder="Confidence (0–1)"
                                value={override.confidenceThreshold ?? ''}
                                onChange={(event) => onConfidenceChange(event.currentTarget.value)}
                                disabled={disabled}
                                aria-label={`${definition.label} — confidence threshold`}
                            />
                        ) : null}

                        {definition.supportsDuration ? (
                            <Input
                                type="number"
                                min={1}
                                max={600000}
                                step="100"
                                placeholder="Duration (ms)"
                                value={override.durationThresholdMs ?? ''}
                                onChange={(event) => onDurationChange(event.currentTarget.value)}
                                disabled={disabled}
                                aria-label={`${definition.label} — duration threshold`}
                            />
                        ) : null}

                        {definition.supportsRepeat ? (
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                step="1"
                                placeholder="Repeat count"
                                value={override.repeatThreshold ?? ''}
                                onChange={(event) => onRepeatChange(event.currentTarget.value)}
                                disabled={disabled}
                                aria-label={`${definition.label} — repeat threshold`}
                            />
                        ) : null}
                    </>
                ) : null}
            </div>
        </div>
    );
}
