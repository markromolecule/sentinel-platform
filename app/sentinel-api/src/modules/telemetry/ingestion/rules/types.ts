import type { TelemetryEventType, TelemetryRuleKey } from '@sentinel/shared';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import type { PersistableProctoringEvent, ProctoringEventBody } from '../ingestion.dto';

export type ImportantTelemetryDecision =
    | {
          action: 'ignore';
      }
    | {
          action: 'persist';
          payload: PersistableProctoringEvent;
      };

export interface TelemetryRule {
    ruleKey: TelemetryRuleKey;
    eventTypes: TelemetryEventType[];
    isEnabled(config: ExamConfigurationValues): boolean;
    evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision>;
}
