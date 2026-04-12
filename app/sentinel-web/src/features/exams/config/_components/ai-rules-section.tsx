import {
    Badge,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@sentinel/ui";
import { useFormContext } from "react-hook-form";
import { FormValues } from '@sentinel/shared/types';

type SharedRuleName =
    | "aiRules.gaze_tracking"
    | "aiRules.face_detection"
    | "aiRules.audio_anomaly_detection"
    | "aiRules.multiple_faces_detection";

type WebFieldName =
    | "webSecurity.tab_switching_monitor"
    | "webSecurity.full_screen_required"
    | "webSecurity.clipboard_control"
    | "webSecurity.right_click_disable"
    | "webSecurity.print_screen_disable";

type MobileFieldName =
    | "mobileSecurity.app_pinning_required"
    | "mobileSecurity.prevent_backgrounding"
    | "mobileSecurity.notification_block"
    | "mobileSecurity.screenshot_block"
    | "mobileSecurity.root_jailbreak_detection";

type RuleItem = {
    name: SharedRuleName | WebFieldName | MobileFieldName;
    label: string;
    description: string;
};

const SHARED_RULES: RuleItem[] = [
    {
        name: "aiRules.gaze_tracking",
        label: "Gaze Tracking",
        description: "Monitor attention drift and off-screen viewing patterns.",
    },
    {
        name: "aiRules.face_detection",
        label: "Face Detection",
        description: "Require a clearly visible face throughout the attempt.",
    },
    {
        name: "aiRules.audio_anomaly_detection",
        label: "Audio Anomaly Detection",
        description: "Flag suspicious voices, whispering, or unexpected audio.",
    },
    {
        name: "aiRules.multiple_faces_detection",
        label: "Multiple Faces Detection",
        description: "Detect additional people entering the camera frame.",
    },
];

const WEB_RULES: RuleItem[] = [
    {
        name: "webSecurity.tab_switching_monitor",
        label: "Tab Switching Monitor",
        description: "Log browser tab changes or focus loss events.",
    },
    {
        name: "webSecurity.full_screen_required",
        label: "Full-Screen Required",
        description: "Require the exam to remain in full-screen mode.",
    },
    {
        name: "webSecurity.clipboard_control",
        label: "Clipboard Control",
        description: "Restrict copy and paste activity during the attempt.",
    },
    {
        name: "webSecurity.right_click_disable",
        label: "Right-Click Disable",
        description: "Limit context-menu actions that can expose browser tools.",
    },
    {
        name: "webSecurity.print_screen_disable",
        label: "Print Screen Disable",
        description: "Block supported screen capture shortcuts where available.",
    },
];

const MOBILE_RULES: RuleItem[] = [
    {
        name: "mobileSecurity.app_pinning_required",
        label: "App Pinning Required",
        description: "Keep the exam app pinned in the foreground on mobile.",
    },
    {
        name: "mobileSecurity.prevent_backgrounding",
        label: "Prevent Backgrounding",
        description: "Flag when the exam app is sent to the background.",
    },
    {
        name: "mobileSecurity.notification_block",
        label: "Notification Block",
        description: "Reduce interruption risk from system notifications.",
    },
    {
        name: "mobileSecurity.screenshot_block",
        label: "Screenshot Block",
        description: "Block screenshots and screen recordings on supported devices.",
    },
    {
        name: "mobileSecurity.root_jailbreak_detection",
        label: "Root / Jailbreak Detection",
        description: "Flag compromised devices that weaken exam protections.",
    },
];

function getNestedBooleanValue(values: FormValues, path: RuleItem['name']) {
    const parts = path.split('.');
    let current: unknown = values;

    for (const part of parts) {
        if (typeof current !== 'object' || current === null || !(part in current)) {
            return false;
        }

        current = (current as Record<string, unknown>)[part];
    }

    return current === true;
}

function countEnabledRules(rules: RuleItem[], values: FormValues) {
    return rules.filter((rule) => getNestedBooleanValue(values, rule.name)).length;
}

function RuleToggleGrid({ rules }: { rules: RuleItem[] }) {
    const { control } = useFormContext<FormValues>();

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rules.map((rule) => (
                <FormField
                    key={rule.name}
                    control={control}
                    name={rule.name}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start justify-between gap-3 rounded-xl border p-4">
                            <div className="space-y-1">
                                <FormLabel className="text-sm font-medium leading-none">
                                    {rule.label}
                                </FormLabel>
                                <FormDescription>
                                    {rule.description}
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value as boolean}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            ))}
        </div>
    );
}

export function AiRulesSection() {
    const form = useFormContext<FormValues>();
    const values = form.watch();
    const sharedEnabledCount = countEnabledRules(SHARED_RULES, values);
    const webEnabledCount = countEnabledRules(WEB_RULES, values);
    const mobileEnabledCount = countEnabledRules(MOBILE_RULES, values);

    return (
        <div className="space-y-4">
            <div className="rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-semibold">Shared Monitoring</h4>
                        <p className="text-xs text-muted-foreground">
                            Signals used across both platforms during identity and behavior checks.
                        </p>
                    </div>
                    <Badge variant="secondary" className="rounded-md px-2 py-0 text-[10px] font-medium">
                        {sharedEnabledCount} enabled
                    </Badge>
                </div>
                <RuleToggleGrid rules={SHARED_RULES} />
            </div>

            <div className="rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-semibold">Platform Safeguards</h4>
                        <p className="text-xs text-muted-foreground">
                            Controls that only apply on one platform, separated to keep navigation simple.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-md text-[10px]">
                            Web {webEnabledCount}
                        </Badge>
                        <Badge variant="outline" className="rounded-md text-[10px]">
                            Mobile {mobileEnabledCount}
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="web" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 gap-1 bg-muted/50">
                        <TabsTrigger value="web">Web Proctoring</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile Proctoring</TabsTrigger>
                    </TabsList>
                    <TabsContent value="web" className="mt-4">
                        <RuleToggleGrid rules={WEB_RULES} />
                    </TabsContent>
                    <TabsContent value="mobile" className="mt-4">
                        <RuleToggleGrid rules={MOBILE_RULES} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
