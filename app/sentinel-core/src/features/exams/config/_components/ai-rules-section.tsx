import { Badge, Separator } from '@sentinel/ui';
import type { ExamConfigurationState } from '@sentinel/services';
import { useFormContext } from 'react-hook-form';
import { ConfigToggleRow } from './config-toggle-row';
import { AutomaticClosePolicySection } from './automatic-close-policy-section';
import {
    RuleItem,
    SHARED_RULES,
    WEB_RULES,
    MOBILE_RULES,
    countEnabledRules,
} from './ai-rules.constants';

/**
 * Renders a grid of configuration toggle switches for a set of rules.
 *
 * @param props - Component properties.
 * @param props.rules - List of rules to display toggles for.
 */
function RuleToggleGrid({ rules }: { rules: RuleItem[] }) {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rules.map((rule) => (
                <ConfigToggleRow
                    key={rule.name}
                    name={rule.name}
                    label={rule.label}
                    description={rule.description}
                />
            ))}
        </div>
    );
}

/**
 * Renders a categorized group of monitoring rules with a title, description, and dynamic badge.
 *
 * @param props - Component properties.
 * @param props.title - Title of the rule group.
 * @param props.description - Brief description of what is checked in this group.
 * @param props.badge - Text showing how many checks are currently enabled.
 * @param props.rules - List of rules contained within this group.
 */
function MonitoringGroup({
    title,
    description,
    badge,
    rules,
}: {
    title: string;
    description: string;
    badge: string;
    rules: RuleItem[];
}) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
                <Badge
                    variant="secondary"
                    className="w-fit rounded-md px-2 py-0 text-[10px] font-medium"
                >
                    {badge}
                </Badge>
            </div>
            <RuleToggleGrid rules={rules} />
        </section>
    );
}

export function AiRulesSection() {
    const form = useFormContext<ExamConfigurationState>();
    const values = form.watch();
    const sharedEnabledCount = countEnabledRules(SHARED_RULES, values);
    const webEnabledCount = countEnabledRules(WEB_RULES, values);
    const mobileEnabledCount = countEnabledRules(MOBILE_RULES, values);
    const policyEnabled = values.configuration?.automaticClosePolicy?.enabled !== false;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-base font-semibold tracking-tight">Monitoring rules</h3>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                    Review the shared checks first, then adjust the platform-specific safeguards for
                    web and mobile sessions.
                </p>
            </div>

            <MonitoringGroup
                title="Shared monitoring"
                description="Signals applied across both platforms during identity and behavior checks."
                badge={`${sharedEnabledCount} enabled`}
                rules={SHARED_RULES}
            />

            <Separator />

            <MonitoringGroup
                title="Web browser safeguards"
                description="Browser-specific controls for focus tracking, fullscreen, and copy-protection behavior."
                badge={`${webEnabledCount} enabled`}
                rules={WEB_RULES}
            />

            <Separator />

            <MonitoringGroup
                title="Mobile safeguards"
                description="Foreground, screenshot, and device-integrity protections enforced on mobile sessions."
                badge={`${mobileEnabledCount} enabled`}
                rules={MOBILE_RULES}
            />

            <Separator />

            <AutomaticClosePolicySection policyEnabled={policyEnabled} />
        </div>
    );
}
