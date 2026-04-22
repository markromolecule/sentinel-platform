import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@sentinel/ui';
import { ShieldAlert } from 'lucide-react';
import type { ViewProps } from '../shared/telemetry-types';
import { RULE_DEFINITIONS, RULE_GROUPS } from '../shared/telemetry-types';
import {
    countConfiguredOverridesByGroup,
    updateRuleOverrideField,
    parseOptionalNumber,
} from '../shared/telemetry-utils';
import { StatusStrip } from '../shared/status-strip';
import { RuleOverrideRow } from '../shared/rule-override-row';

export function RulesView({ currentDraft, updateSettingsAction, isPending }: ViewProps) {
    const groupedRules = useMemo(
        () =>
            RULE_GROUPS.map((group) => ({
                ...group,
                definitions: RULE_DEFINITIONS.filter((definition) => definition.group === group.id),
            })),
        [],
    );

    return (
        <section id="rules" className="scroll-mt-24 space-y-8 py-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">Rule Overrides</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Fine-tune detection thresholds and severity for specific proctoring signals.
                    </p>
                </div>

                <Alert className="border-primary/20 bg-primary/5 py-4">
                    <ShieldAlert className="text-primary size-5" />
                    <AlertTitle className="ml-2 text-sm font-semibold">
                        Override Precedence
                    </AlertTitle>
                    <AlertDescription className="ml-2 text-xs leading-relaxed opacity-80">
                        Support settings can tighten thresholds, pin severity, or disable a rule
                        globally — but cannot force a rule to run when the exam already turned it
                        off.
                    </AlertDescription>
                </Alert>

                <StatusStrip
                    items={[
                        {
                            label: 'Threshold Triggered',
                            value: 'First reviewable occurrence',
                            hint: 'The event crossed its confidence, duration, or baseline persistence threshold.',
                        },
                        {
                            label: 'Repeat Escalated',
                            value: 'Same rule repeated',
                            hint: 'Severity climbs only when the same rule repeats inside its matching window.',
                        },
                        {
                            label: 'Immediate High',
                            value: 'High on first persist',
                            hint: 'Screenshot, jailbreak, app pinning, and similar rules stay severe immediately.',
                        },
                        {
                            label: 'Forced Override',
                            value: 'Support-pinned severity',
                            hint: 'When severity is pinned here, review surfaces should show that it was forced.',
                        },
                    ]}
                />

                <Alert className="border-amber-500/20 bg-amber-500/5 py-4">
                    <ShieldAlert className="size-5 text-amber-500" />
                    <AlertTitle className="ml-2 text-sm font-semibold text-amber-700">
                        Operator Note
                    </AlertTitle>
                    <AlertDescription className="ml-2 text-xs leading-relaxed text-amber-800/80">
                        Older incident rows may not include `severityReason` or `severityInputs`. In
                        those cases, reviewers should fall back to the stored severity, occurrence
                        count, and last event details instead of assuming repeat escalation.
                    </AlertDescription>
                </Alert>

                <StatusStrip
                    items={[
                        {
                            label: 'AI Rules',
                            value: `${countConfiguredOverridesByGroup(currentDraft.ruleOverrides, 'ai')} active`,
                            hint: 'Camera & audio',
                        },
                        {
                            label: 'Web Rules',
                            value: `${countConfiguredOverridesByGroup(currentDraft.ruleOverrides, 'web')} active`,
                            hint: 'Browser safeguards',
                        },
                        {
                            label: 'Mobile Rules',
                            value: `${countConfiguredOverridesByGroup(currentDraft.ruleOverrides, 'mobile')} active`,
                            hint: 'App constraints',
                        },
                    ]}
                />
            </div>

            <div className="space-y-10">
                {groupedRules.map((group) => (
                    <div key={group.id} className="space-y-4">
                        <div className="space-y-1 px-1">
                            <h3 className="text-base font-semibold tracking-tight">
                                {group.label}
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                {group.description}
                            </p>
                        </div>
                        <div className="bg-card/50 divide-y rounded-xl border px-4">
                            {group.definitions.map((definition) => {
                                const override = currentDraft.ruleOverrides[definition.key];
                                return (
                                    <RuleOverrideRow
                                        key={definition.key}
                                        definition={definition}
                                        override={override}
                                        disabled={isPending}
                                        onEnabledChange={(value) =>
                                            updateSettingsAction((settings) =>
                                                updateRuleOverrideField(
                                                    settings,
                                                    definition.key,
                                                    'enabled',
                                                    value === '' ? undefined : value === 'true',
                                                ),
                                            )
                                        }
                                        onSeverityChange={(value) =>
                                            updateSettingsAction((settings) =>
                                                updateRuleOverrideField(
                                                    settings,
                                                    definition.key,
                                                    'severity',
                                                    value === '' ? undefined : value,
                                                ),
                                            )
                                        }
                                        onConfidenceChange={(value) =>
                                            updateSettingsAction((settings) =>
                                                updateRuleOverrideField(
                                                    settings,
                                                    definition.key,
                                                    'confidenceThreshold',
                                                    parseOptionalNumber(value),
                                                ),
                                            )
                                        }
                                        onDurationChange={(value) =>
                                            updateSettingsAction((settings) =>
                                                updateRuleOverrideField(
                                                    settings,
                                                    definition.key,
                                                    'durationThresholdMs',
                                                    parseOptionalNumber(value),
                                                ),
                                            )
                                        }
                                        onRepeatChange={(value) =>
                                            updateSettingsAction((settings) =>
                                                updateRuleOverrideField(
                                                    settings,
                                                    definition.key,
                                                    'repeatThreshold',
                                                    parseOptionalNumber(value),
                                                ),
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
