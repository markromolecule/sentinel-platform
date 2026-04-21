import { type DbClient } from '@sentinel/db';
import type { TelemetryRuleKey } from '@sentinel/shared';
import type { TelemetryRuleOverride, TelemetrySettingsRecord } from '@sentinel/shared/types';
import type { ProctoringEventBody } from '../ingestion.dto';
import { telemetryConfigurationResolverService } from './telemetry-configuration-resolver.service';
import { telemetryRuleRegistry } from '../rules/registry';
import type { ImportantTelemetryDecision } from '../rules/types';
import type {
    PersistableProctoringEvent,
    TelemetryRuntimeSettingsSnapshot,
} from '../ingestion.dto';

function getRuntimeRuleOverride(
    settingsRecord: TelemetrySettingsRecord | undefined,
    ruleKey: TelemetryRuleKey,
): TelemetryRuleOverride | null {
    if (!settingsRecord) {
        return null;
    }

    return settingsRecord.value.ruleOverrides[ruleKey] ?? null;
}

function buildRuntimeSettingsSnapshot(
    settingsRecord: TelemetrySettingsRecord | undefined,
    runtimeOverride: TelemetryRuleOverride | null,
): TelemetryRuntimeSettingsSnapshot | undefined {
    if (!settingsRecord) {
        return undefined;
    }

    return {
        version: settingsRecord.value.version,
        operations: settingsRecord.value.operations,
        ruleOverrideApplied: runtimeOverride,
    };
}

function withRuntimeSettingsSnapshot(
    payload: PersistableProctoringEvent,
    settingsRecord: TelemetrySettingsRecord | undefined,
    runtimeOverride: TelemetryRuleOverride | null,
): PersistableProctoringEvent {
    return {
        ...payload,
        runtimeSettingsSnapshot: buildRuntimeSettingsSnapshot(settingsRecord, runtimeOverride),
    };
}

export class TelemetryPolicyService {
    async filterImportantEvent(
        db: DbClient,
        payload: ProctoringEventBody,
        settingsRecord?: TelemetrySettingsRecord,
    ): Promise<ImportantTelemetryDecision> {
        const configuration =
            await telemetryConfigurationResolverService.resolveAttemptConfiguration(
                db,
                payload.examSessionId,
            );
        const runtimeOverride = getRuntimeRuleOverride(settingsRecord, payload.ruleKey);

        if (runtimeOverride?.enabled === false) {
            console.log('[TelemetryPolicy] Event ignored: rule disabled by telemetry settings', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                settingsVersion: settingsRecord?.value.version ?? null,
            });
            return { action: 'ignore' };
        }

        if (
            configuration &&
            !telemetryConfigurationResolverService.isRuleEnabled(configuration, payload.ruleKey)
        ) {
            console.log('[TelemetryPolicy] Event ignored: rule disabled by configuration', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                platform: payload.platform,
                settingsVersion: settingsRecord?.value.version ?? null,
            });
            return { action: 'ignore' };
        }

        const rule = telemetryRuleRegistry.getRuleByEventType(payload.eventType);

        if (!rule) {
            // Default behavior: ignore unknown events.
            // MODIFICATION: If the event source is SERVER or AI (processed), we should consider persisting it
            // anyway if assigned a ruleKey, even if no specific evaluation rule is found in the registry.
            if (payload.source !== 'CLIENT') {
                console.log(
                    '[TelemetryPolicy] Event auto-flagged for persistence (non-client source)',
                    {
                        attemptId: payload.examSessionId,
                        eventType: payload.eventType,
                        source: payload.source,
                        settingsVersion: settingsRecord?.value.version ?? null,
                    },
                );
                return {
                    action: 'persist',
                    payload: withRuntimeSettingsSnapshot(payload, settingsRecord, runtimeOverride),
                };
            }

            console.log('[TelemetryPolicy] Event ignored: no rule found for event type', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                settingsVersion: settingsRecord?.value.version ?? null,
            });
            return { action: 'ignore' };
        }

        const decision = await rule.evaluate(payload, runtimeOverride ?? undefined);

        if (decision.action === 'ignore') {
            console.log('[TelemetryPolicy] Event ignored: threshold not met', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                platform: payload.platform,
                settingsVersion: settingsRecord?.value.version ?? null,
            });
        } else {
            console.log('[TelemetryPolicy] Event flagged for persistence', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                platform: payload.platform,
                trigger: decision.payload.metadata?.aggregation?.trigger,
                settingsVersion: settingsRecord?.value.version ?? null,
                runtimeOverride,
            });
        }

        if (decision.action === 'ignore') {
            return decision;
        }

        return {
            action: 'persist',
            payload: withRuntimeSettingsSnapshot(decision.payload, settingsRecord, runtimeOverride),
        };
    }
}

export const telemetryPolicyService = new TelemetryPolicyService();
