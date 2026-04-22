'use client';

import { Badge, Switch } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

type NestedRuleSection = 'defaultWebSecurity' | 'defaultMobileSecurity';

const WEB_RULES: Array<{ key: keyof ExaminationGlobalSettings['defaultWebSecurity']; label: string; description: string }> = [
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

const MOBILE_RULES: Array<{ key: keyof ExaminationGlobalSettings['defaultMobileSecurity']; label: string; description: string }> = [
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
    updateNestedField: <TSection extends NestedRuleSection, TKey extends keyof ExaminationGlobalSettings[TSection]>(
        section: TSection,
        key: TKey,
        value: ExaminationGlobalSettings[TSection][TKey]
    ) => void;
};

export function SafeguardsView({ draft, isPending, updateNestedField }: SafeguardsViewProps) {
    return (
        <div className="space-y-16">
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                            Web Client Safeguards
                        </h2>
                        <p className="text-muted-foreground mt-1 text-xs font-medium">
                            Protections applied to browser-based exam sessions.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-background">
                        {Object.values(draft.defaultWebSecurity).filter(Boolean).length} Active
                    </Badge>
                </div>
                <div className="grid gap-x-12 gap-y-2 lg:grid-cols-2">
                    {WEB_RULES.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-4 rounded-xl border bg-card/30 p-5 transition-colors hover:bg-card/50">
                            <div className="space-y-1">
                                <div className="text-[13px] font-bold text-foreground/90 uppercase tracking-tight">{item.label}</div>
                                <div className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-70 italic">{item.description}</div>
                            </div>
                            <Switch 
                                checked={Boolean(draft.defaultWebSecurity[item.key])} 
                                onCheckedChange={(c) => updateNestedField('defaultWebSecurity', item.key, c as never)} 
                                disabled={isPending} 
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                            Mobile App Safeguards
                        </h2>
                        <p className="text-muted-foreground mt-1 text-xs font-medium">
                            Protections for native iOS and Android clients.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-background">
                        {Object.values(draft.defaultMobileSecurity).filter(Boolean).length} Active
                    </Badge>
                </div>
                <div className="grid gap-x-12 gap-y-2 lg:grid-cols-2">
                    {MOBILE_RULES.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-4 rounded-xl border bg-card/30 p-5 transition-colors hover:bg-card/50">
                            <div className="space-y-1">
                                <div className="text-[13px] font-bold text-foreground/90 uppercase tracking-tight">{item.label}</div>
                                <div className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-70 italic">{item.description}</div>
                            </div>
                            <Switch 
                                checked={Boolean(draft.defaultMobileSecurity[item.key])} 
                                onCheckedChange={(c) => updateNestedField('defaultMobileSecurity', item.key, c as never)} 
                                disabled={isPending} 
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
