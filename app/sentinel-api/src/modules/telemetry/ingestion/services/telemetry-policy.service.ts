import { type DbClient } from '@sentinel/db';
import type { ProctoringEventBody } from '../ingestion.dto';
import { telemetryConfigurationResolverService } from './telemetry-configuration-resolver.service';
import { telemetryRuleRegistry } from '../rules/registry';
import type { ImportantTelemetryDecision } from '../rules/types';

export class TelemetryPolicyService {
    async filterImportantEvent(
        db: DbClient,
        payload: ProctoringEventBody,
    ): Promise<ImportantTelemetryDecision> {
        const configuration =
            await telemetryConfigurationResolverService.resolveAttemptConfiguration(
                db,
                payload.examSessionId,
            );

        if (
            configuration &&
            !telemetryConfigurationResolverService.isRuleEnabled(configuration, payload.ruleKey)
        ) {
            console.log('[TelemetryPolicy] Event ignored: rule disabled by configuration', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                platform: payload.platform,
            });
            return { action: 'ignore' };
        }

        const rule = telemetryRuleRegistry.getRuleByEventType(payload.eventType);

        if (!rule) {
            console.log('[TelemetryPolicy] Event ignored: no rule found for event type', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
            });
            return { action: 'ignore' };
        }

        const decision = await rule.evaluate(payload);

        if (decision.action === 'ignore') {
            console.log('[TelemetryPolicy] Event ignored: threshold not met', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                platform: payload.platform,
            });
        } else {
            console.log('[TelemetryPolicy] Event flagged for persistence', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                ruleKey: payload.ruleKey,
                platform: payload.platform,
                trigger: decision.payload.metadata?.aggregation?.trigger,
            });
        }

        return decision;
    }
}

export const telemetryPolicyService = new TelemetryPolicyService();
