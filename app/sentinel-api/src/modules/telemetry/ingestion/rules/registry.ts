import type { TelemetryEventType, TelemetryRuleKey } from '@sentinel/shared';
import type { ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import {
    AudioAnomalyRule,
    FaceDetectionRule,
    GazeTrackingRule,
    MultipleFacesRule,
} from './ai-rules';
import {
    AppBackgroundingRule,
    AppPinningRule,
    JailbreakRule,
    NotificationBlockRule,
    ScreenshotRule,
} from './mobile-rules';
import type { TelemetryRule } from './types';
import {
    ClipboardRule,
    FullScreenRule,
    PrintScreenRule,
    RightClickRule,
    TabSwitchRule,
} from './web-rules';

class TelemetryRuleRegistry {
    private rules: TelemetryRule[] = [
        // AI Rules
        new GazeTrackingRule(),
        new FaceDetectionRule(),
        new AudioAnomalyRule(),
        new MultipleFacesRule(),
        // Web Rules
        new TabSwitchRule(),
        new FullScreenRule(),
        new ClipboardRule(),
        new RightClickRule(),
        new PrintScreenRule(),
        // Mobile Rules
        new AppBackgroundingRule(),
        new ScreenshotRule(),
        new JailbreakRule(),
        new AppPinningRule(),
        new NotificationBlockRule(),
    ];

    private ruleByKeyMap = new Map<TelemetryRuleKey, TelemetryRule>(
        this.rules.map((rule) => [rule.ruleKey, rule]),
    );

    private ruleByEventTypeMap = new Map<TelemetryEventType, TelemetryRule>(
        this.rules.flatMap((rule) => rule.eventTypes.map((type) => [type, rule])),
    );

    getRuleByKey(ruleKey: TelemetryRuleKey): TelemetryRule | undefined {
        return this.ruleByKeyMap.get(ruleKey);
    }

    getRuleByEventType(eventType: TelemetryEventType): TelemetryRule | undefined {
        return this.ruleByEventTypeMap.get(eventType);
    }

    isRuleEnabled(ruleKey: TelemetryRuleKey, config: ExamConfigurationValues): boolean {
        const rule = this.ruleByKeyMap.get(ruleKey);
        return rule ? rule.isEnabled(config) : false;
    }
}

export const telemetryRuleRegistry = new TelemetryRuleRegistry();
