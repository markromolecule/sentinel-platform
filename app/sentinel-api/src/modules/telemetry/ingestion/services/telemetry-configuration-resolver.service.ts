import { type DbClient } from '@sentinel/db';
import type { TelemetryRuleKey } from '@sentinel/shared';
import { getExamConfigurationState } from '../../../examination/configuration/services/get-exam-configuration-state.service';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import { telemetryRuleRegistry } from '../rules/registry';

export class TelemetryConfigurationResolverService {
    async resolveAttemptConfiguration(
        db: DbClient,
        attemptId: string,
    ): Promise<ExamConfigurationValues | null> {
        const attempt = await db
            .selectFrom('exam_attempts')
            .select('exam_id')
            .where('attempt_id', '=', attemptId)
            .executeTakeFirst();

        if (!attempt?.exam_id) {
            return null;
        }

        const configurationState = await getExamConfigurationState(db, attempt.exam_id);
        return configurationState.configuration;
    }

    isRuleEnabled(configuration: ExamConfigurationValues, ruleKey: TelemetryRuleKey): boolean {
        return telemetryRuleRegistry.isRuleEnabled(ruleKey, configuration);
    }
}

export const telemetryConfigurationResolverService = new TelemetryConfigurationResolverService();
