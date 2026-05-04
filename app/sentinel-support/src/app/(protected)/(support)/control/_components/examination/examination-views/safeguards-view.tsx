'use client';

import { Badge, Switch } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

type NestedRuleSection = 'defaultWebSecurity' | 'defaultMobileSecurity';

const WEB_RULES: Array<{
    key: keyof ExaminationGlobalSettings['defaultWebSecurity'];
    label: string;
    description: string;
}> = [
    {
        key: 'tab_switching_monitor',
        label: 'Tab switching monitor',
        description: 'Track browser focus changes and tab switching.',
    },
    {
        key: 'full_screen_required',
        label: 'Full-screen required',
        description: 'Require the web exam to stay in full-screen mode.',
    },
    {
        key: 'clipboard_control',
        label: 'Clipboard control',
        description: 'Restrict copy and paste actions on the web client.',
    },
    {
        key: 'right_click_disable',
        label: 'Right-click disable',
        description: 'Reduce access to browser context tools during the session.',
    },
    {
        key: 'print_screen_disable',
        label: 'Print screen disable',
        description: 'Block or discourage screenshot shortcuts where supported.',
    },
];

const MOBILE_RULES: Array<{
    key: keyof ExaminationGlobalSettings['defaultMobileSecurity'];
    label: string;
    description: string;
}> = [
    {
        key: 'app_pinning_required',
        label: 'App pinning required',
        description: 'Keep the mobile exam app pinned in the foreground.',
    },
    {
        key: 'prevent_backgrounding',
        label: 'Prevent backgrounding',
        description: 'Flag attempts to leave the exam app during the session.',
    },
    {
        key: 'notification_block',
        label: 'Notification block',
        description: 'Reduce interruption risk from notifications and overlays.',
    },
    {
        key: 'screenshot_block',
        label: 'Screenshot block',
        description: 'Block screenshots and recordings on supported devices.',
    },
    {
        key: 'root_jailbreak_detection',
        label: 'Root / jailbreak detection',
        description: 'Detect compromised devices that weaken the security baseline.',
    },
];

type SafeguardsViewProps = {
    draft: ExaminationGlobalSettings;
    isPending: boolean;
    updateNestedField: <
        TSection extends NestedRuleSection,
        TKey extends keyof ExaminationGlobalSettings[TSection],
    >(
        section: TSection,
        key: TKey,
        value: ExaminationGlobalSettings[TSection][TKey],
    ) => void;
};

export function SafeguardsView({ draft, isPending, updateNestedField }: SafeguardsViewProps) {
    return (
        <div className="space-y-12">
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <h3 className="text-muted-foreground/80 text-[12px] font-semibold">
                            Web Client Safeguards
                        </h3>
                        <p className="text-foreground text-[14px] font-semibold">
                            Protections applied to browser-based exam sessions.
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-muted/50 text-muted-foreground bg-background rounded-none text-[12px] font-semibold"
                    >
                        {Object.values(draft.defaultWebSecurity).filter(Boolean).length} Active
                    </Badge>
                </div>
                <div className="grid grid-cols-1 border-t border-l sm:grid-cols-2">
                    {WEB_RULES.map((item) => (
                        <div
                            key={item.key}
                            className="bg-background hover:bg-muted/5 flex items-start justify-between gap-4 border-r border-b p-5 transition-colors"
                        >
                            <div className="space-y-1">
                                <div className="text-foreground text-[14px] font-semibold">
                                    {item.label}
                                </div>
                                <div className="text-muted-foreground text-[12px] leading-relaxed font-medium opacity-70">
                                    {item.description}
                                </div>
                            </div>
                            <Switch
                                checked={Boolean(draft.defaultWebSecurity[item.key])}
                                onCheckedChange={(c) =>
                                    updateNestedField('defaultWebSecurity', item.key, c as never)
                                }
                                disabled={isPending}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <h3 className="text-muted-foreground/80 text-[12px] font-semibold">
                            Mobile App Safeguards
                        </h3>
                        <p className="text-foreground text-[14px] font-semibold">
                            Protections for native iOS and Android clients.
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-muted/50 text-muted-foreground bg-background rounded-none text-[12px] font-semibold"
                    >
                        {Object.values(draft.defaultMobileSecurity).filter(Boolean).length} Active
                    </Badge>
                </div>
                <div className="grid grid-cols-1 border-t border-l sm:grid-cols-2">
                    {MOBILE_RULES.map((item) => (
                        <div
                            key={item.key}
                            className="bg-background hover:bg-muted/5 flex items-start justify-between gap-4 border-r border-b p-5 transition-colors"
                        >
                            <div className="space-y-1">
                                <div className="text-foreground text-[14px] font-semibold">
                                    {item.label}
                                </div>
                                <div className="text-muted-foreground text-[12px] leading-relaxed font-medium opacity-70">
                                    {item.description}
                                </div>
                            </div>
                            <Switch
                                checked={Boolean(draft.defaultMobileSecurity[item.key])}
                                onCheckedChange={(c) =>
                                    updateNestedField('defaultMobileSecurity', item.key, c as never)
                                }
                                disabled={isPending}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
