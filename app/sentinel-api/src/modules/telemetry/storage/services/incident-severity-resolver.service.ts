import type { incident_severity } from '@sentinel/db';
import type { TelemetryRuleKey } from '@sentinel/shared';
import type { TelemetryRuleOverride } from '@sentinel/shared/types';

export type SeverityReason =
    | 'default-ladder'
    | 'repeat-escalated'
    | 'forced-override'
    | 'immediate-high'
    | 'threshold-fixed';

export type StoredMatchingIncident = {
    timestamp: Date | string | null;
    details: unknown;
};

type SeverityTier = {
    severity: incident_severity;
    minCount: number;
    windowSeconds: number | null;
};

type SeverityStrategy =
    | {
          kind: 'immediate';
          baseSeverity: incident_severity;
      }
    | {
          kind: 'fixed';
          baseSeverity: incident_severity;
      }
    | {
          kind: 'ladder';
          baseSeverity: incident_severity;
          tiers: SeverityTier[];
          repeatThresholdTierIndex: number;
      };

export type SeverityResolution = {
    finalSeverity: incident_severity;
    severityReason: SeverityReason;
    severityInputs: {
        baseSeverity: incident_severity;
        ladder: incident_severity[];
        matchingCount: number;
        matchingWindowSeconds: number | null;
        repeatThreshold: number | null;
        overrideSeverity: incident_severity | null;
    };
};

const SEVERITY_STRATEGIES: Record<TelemetryRuleKey, SeverityStrategy> = {
    'aiRules.gaze_tracking': {
        kind: 'ladder',
        baseSeverity: 'LOW',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'LOW', minCount: 1, windowSeconds: null },
            { severity: 'MEDIUM', minCount: 2, windowSeconds: 120 },
            { severity: 'HIGH', minCount: 4, windowSeconds: 300 },
        ],
    },
    'aiRules.face_detection': {
        kind: 'ladder',
        baseSeverity: 'MEDIUM',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'MEDIUM', minCount: 1, windowSeconds: null },
            { severity: 'HIGH', minCount: 2, windowSeconds: 120 },
        ],
    },
    'aiRules.audio_anomaly_detection': {
        kind: 'ladder',
        baseSeverity: 'LOW',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'LOW', minCount: 1, windowSeconds: null },
            { severity: 'MEDIUM', minCount: 2, windowSeconds: 120 },
            { severity: 'HIGH', minCount: 4, windowSeconds: 300 },
        ],
    },
    'aiRules.multiple_faces_detection': {
        kind: 'fixed',
        baseSeverity: 'HIGH',
    },
    'webSecurity.tab_switching_monitor': {
        kind: 'ladder',
        baseSeverity: 'MEDIUM',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'MEDIUM', minCount: 1, windowSeconds: null },
            { severity: 'HIGH', minCount: 2, windowSeconds: 300 },
        ],
    },
    'webSecurity.full_screen_required': {
        kind: 'ladder',
        baseSeverity: 'MEDIUM',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'MEDIUM', minCount: 1, windowSeconds: null },
            { severity: 'HIGH', minCount: 2, windowSeconds: 300 },
        ],
    },
    'webSecurity.clipboard_control': {
        kind: 'ladder',
        baseSeverity: 'MEDIUM',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'MEDIUM', minCount: 1, windowSeconds: null },
            { severity: 'HIGH', minCount: 2, windowSeconds: 300 },
        ],
    },
    'webSecurity.right_click_disable': {
        kind: 'ladder',
        baseSeverity: 'LOW',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'LOW', minCount: 1, windowSeconds: null },
            { severity: 'MEDIUM', minCount: 2, windowSeconds: 120 },
            { severity: 'HIGH', minCount: 4, windowSeconds: 300 },
        ],
    },
    'webSecurity.print_screen_disable': {
        kind: 'immediate',
        baseSeverity: 'HIGH',
    },
    'mobileSecurity.app_pinning_required': {
        kind: 'immediate',
        baseSeverity: 'HIGH',
    },
    'mobileSecurity.prevent_backgrounding': {
        kind: 'ladder',
        baseSeverity: 'MEDIUM',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'MEDIUM', minCount: 1, windowSeconds: null },
            { severity: 'HIGH', minCount: 2, windowSeconds: 300 },
        ],
    },
    'mobileSecurity.notification_block': {
        kind: 'ladder',
        baseSeverity: 'LOW',
        repeatThresholdTierIndex: 1,
        tiers: [
            { severity: 'LOW', minCount: 1, windowSeconds: null },
            { severity: 'MEDIUM', minCount: 2, windowSeconds: 300 },
            { severity: 'HIGH', minCount: 4, windowSeconds: 600 },
        ],
    },
    'mobileSecurity.screenshot_block': {
        kind: 'immediate',
        baseSeverity: 'HIGH',
    },
    'mobileSecurity.root_jailbreak_detection': {
        kind: 'immediate',
        baseSeverity: 'HIGH',
    },
};

function safeParseDetails(details: unknown): Record<string, unknown> {
    if (!details) {
        return {};
    }

    if (typeof details === 'string') {
        try {
            const parsed = JSON.parse(details);
            return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
        } catch {
            return {};
        }
    }

    return typeof details === 'object' ? (details as Record<string, unknown>) : {};
}

function getOccurrenceCount(details: unknown): number {
    const parsed = safeParseDetails(details);
    const occurrenceCount = parsed.occurrenceCount;

    return typeof occurrenceCount === 'number' && occurrenceCount > 0 ? occurrenceCount : 1;
}

function normalizeTimestamp(value: Date | string | null): Date | null {
    if (!value) {
        return null;
    }

    return value instanceof Date ? value : new Date(value);
}

function scaleLadderThresholds(
    strategy: Extract<SeverityStrategy, { kind: 'ladder' }>,
    runtimeOverride?: TelemetryRuleOverride | null,
): { ladder: SeverityTier[]; effectiveRepeatThreshold: number } {
    const defaultRepeatThreshold = strategy.tiers[strategy.repeatThresholdTierIndex]?.minCount ?? 1;
    const effectiveRepeatThreshold = runtimeOverride?.repeatThreshold ?? defaultRepeatThreshold;

    const ladder = strategy.tiers.map((tier, index) => {
        if (index < strategy.repeatThresholdTierIndex || tier.minCount <= 1) {
            return tier;
        }

        const multiplier = tier.minCount / defaultRepeatThreshold;
        return {
            ...tier,
            minCount: Math.max(1, Math.round(multiplier * effectiveRepeatThreshold)),
        };
    });

    return {
        ladder,
        effectiveRepeatThreshold,
    };
}

function countOccurrencesWithinWindow(
    incidents: StoredMatchingIncident[],
    now: Date,
    windowSeconds: number | null,
): number {
    if (windowSeconds === null) {
        return 1;
    }

    const threshold = now.getTime() - windowSeconds * 1000;

    return (
        incidents.reduce((total, incident) => {
            const timestamp = normalizeTimestamp(incident.timestamp);

            if (!timestamp || timestamp.getTime() < threshold) {
                return total;
            }

            return total + getOccurrenceCount(incident.details);
        }, 0) + 1
    );
}

export class IncidentSeverityResolverService {
    getLookbackWindowSeconds(ruleKey: TelemetryRuleKey, dedupeWindowSeconds: number): number {
        const strategy = SEVERITY_STRATEGIES[ruleKey];

        if (!strategy) {
            return dedupeWindowSeconds;
        }

        if (strategy.kind !== 'ladder') {
            return dedupeWindowSeconds;
        }

        const maxWindowSeconds = strategy.tiers.reduce((max, tier) => {
            return Math.max(max, tier.windowSeconds ?? 0);
        }, 0);

        return Math.max(dedupeWindowSeconds, maxWindowSeconds);
    }

    resolveSeverity(args: {
        ruleKey: TelemetryRuleKey;
        baseSeverity: incident_severity;
        matchingIncidents: StoredMatchingIncident[];
        now: Date;
        runtimeOverride?: TelemetryRuleOverride | null;
    }): SeverityResolution {
        const strategy = SEVERITY_STRATEGIES[args.ruleKey];
        const overrideSeverity = args.runtimeOverride?.severity ?? null;

        if (!strategy) {
            return {
                finalSeverity: overrideSeverity ?? args.baseSeverity,
                severityReason: overrideSeverity ? 'forced-override' : 'threshold-fixed',
                severityInputs: {
                    baseSeverity: args.baseSeverity,
                    ladder: [args.baseSeverity],
                    matchingCount: 1,
                    matchingWindowSeconds: null,
                    repeatThreshold: null,
                    overrideSeverity,
                },
            };
        }

        if (strategy.kind === 'immediate' || strategy.kind === 'fixed') {
            const organicSeverity = strategy.baseSeverity;

            return {
                finalSeverity: overrideSeverity ?? organicSeverity,
                severityReason: overrideSeverity
                    ? 'forced-override'
                    : strategy.kind === 'immediate'
                      ? 'immediate-high'
                      : 'threshold-fixed',
                severityInputs: {
                    baseSeverity: strategy.baseSeverity,
                    ladder: [strategy.baseSeverity],
                    matchingCount: 1,
                    matchingWindowSeconds: null,
                    repeatThreshold: null,
                    overrideSeverity,
                },
            };
        }

        const { ladder, effectiveRepeatThreshold } = scaleLadderThresholds(
            strategy,
            args.runtimeOverride,
        );

        let selectedTier = ladder[0];
        for (const tier of ladder) {
            const matchingCount = countOccurrencesWithinWindow(
                args.matchingIncidents,
                args.now,
                tier.windowSeconds,
            );

            if (matchingCount >= tier.minCount) {
                selectedTier = tier;
            }
        }

        const matchingCount = countOccurrencesWithinWindow(
            args.matchingIncidents,
            args.now,
            selectedTier.windowSeconds,
        );
        const organicSeverity = selectedTier.severity;

        return {
            finalSeverity: overrideSeverity ?? organicSeverity,
            severityReason: overrideSeverity
                ? 'forced-override'
                : organicSeverity === strategy.baseSeverity
                  ? 'default-ladder'
                  : 'repeat-escalated',
            severityInputs: {
                baseSeverity: strategy.baseSeverity,
                ladder: ladder.map((tier) => tier.severity),
                matchingCount,
                matchingWindowSeconds: selectedTier.windowSeconds,
                repeatThreshold: effectiveRepeatThreshold,
                overrideSeverity,
            },
        };
    }
}

export const incidentSeverityResolverService = new IncidentSeverityResolverService();
