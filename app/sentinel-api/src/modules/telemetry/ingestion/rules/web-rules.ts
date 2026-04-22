import type { TelemetryEventType, TelemetryRuleKey } from '@sentinel/shared';
import type { TelemetryRuleOverride } from '@sentinel/shared/types';
import type { ProctoringEventBody } from '../ingestion.dto';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import { BaseTelemetryRule } from './abstract.rule';
import type { ImportantTelemetryDecision } from './types';

export class TabSwitchRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'webSecurity.tab_switching_monitor';
    eventTypes: TelemetryEventType[] = ['TAB_SWITCH'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.webSecurity?.tab_switching_monitor ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        _runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class FullScreenRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'webSecurity.full_screen_required';
    eventTypes: TelemetryEventType[] = ['FULL_SCREEN_EXIT'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.webSecurity?.full_screen_required ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        _runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class ClipboardRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'webSecurity.clipboard_control';
    eventTypes: TelemetryEventType[] = ['CLIPBOARD_ATTEMPT'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.webSecurity?.clipboard_control ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        _runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class RightClickRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'webSecurity.right_click_disable';
    eventTypes: TelemetryEventType[] = ['RIGHT_CLICK_ATTEMPT'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.webSecurity?.right_click_disable ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        _runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}

export class PrintScreenRule extends BaseTelemetryRule {
    ruleKey: TelemetryRuleKey = 'webSecurity.print_screen_disable';
    eventTypes: TelemetryEventType[] = ['PRINT_SCREEN_ATTEMPT'];

    isEnabled(config: ExamConfigurationValues): boolean {
        return config.webSecurity?.print_screen_disable ?? false;
    }

    async evaluate(
        payload: ProctoringEventBody,
        _runtimeOverride?: TelemetryRuleOverride,
    ): Promise<ImportantTelemetryDecision> {
        return this.persist(payload, { trigger: 'immediate' });
    }
}
