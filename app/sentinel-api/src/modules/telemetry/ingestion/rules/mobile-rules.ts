import type { TelemetryEventType, TelemetryRuleKey } from '@sentinel/shared';
import type { ProctoringEventBody } from '../ingestion.dto';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import { BaseTelemetryRule } from './abstract.rule';
import type { ImportantTelemetryDecision } from './types';

export class AppBackgroundingRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'mobileSecurity.prevent_backgrounding';
    eventTypes: TelemetryEventType[] = ['APP_BACKGROUNDING'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.mobileSecurity?.prevent_backgrounding ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class ScreenshotRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'mobileSecurity.screenshot_block';
    eventTypes: TelemetryEventType[] = ['SCREENSHOT_ATTEMPT'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.mobileSecurity?.screenshot_block ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class JailbreakRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'mobileSecurity.root_jailbreak_detection';
    eventTypes: TelemetryEventType[] = ['ROOT_JAILBREAK_DETECTED'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.mobileSecurity?.root_jailbreak_detection ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class AppPinningRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'mobileSecurity.app_pinning_required';
    eventTypes: TelemetryEventType[] = ['APP_PINNING_VIOLATION'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.mobileSecurity?.app_pinning_required ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class NotificationBlockRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'mobileSecurity.notification_block';
    eventTypes: TelemetryEventType[] = ['NOTIFICATION_BLOCK_VIOLATION'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.mobileSecurity?.notification_block ?? false;
    }

    async evaluate(payload: ProctoringEventBody): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}
