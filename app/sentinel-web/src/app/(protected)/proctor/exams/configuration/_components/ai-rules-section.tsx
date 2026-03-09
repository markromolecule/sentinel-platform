import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
} from "@sentinel/ui";
import { Switch } from "@sentinel/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sentinel/ui";
import { useFormContext } from "react-hook-form";
import { FormValues } from '@sentinel/shared/types';

type WebFieldName =
    | "aiRules.web.gazeTracking"
    | "aiRules.web.audioDetection"
    | "aiRules.web.tabSwitching"
    | "aiRules.web.copyPaste"
    | "aiRules.web.printScreenDisable";

type MobileFieldName =
    | "aiRules.mobile.gazeTracking"
    | "aiRules.mobile.audioDetection"
    | "aiRules.mobile.appPinning"
    | "aiRules.mobile.screenshotDisable";

type RuleItem = {
    name: WebFieldName | MobileFieldName;
    label: string;
    description: string;
};

const WEB_RULES: RuleItem[] = [
    {
        name: "aiRules.web.gazeTracking",
        label: "Gaze Tracking",
        description: "Monitor eye movement to detect off-screen reading.",
    },
    {
        name: "aiRules.web.audioDetection",
        label: "Audio Anomaly Detection",
        description: "Analyze ambient sound for voices, whispering, or suspicious audio.",
    },
    {
        name: "aiRules.web.tabSwitching",
        label: "Tab Switching Monitor",
        description: "Detect when a student switches to another browser tab or application.",
    },
    {
        name: "aiRules.web.copyPaste",
        label: "Copy-Paste Detection",
        description: "Prevent and detect clipboard copy-paste actions during exams.",
    },
    {
        name: "aiRules.web.printScreenDisable",
        label: "Print Screen Disable",
        description: "Block the Print Screen key to prevent screen capture.",
    },
];

const MOBILE_RULES: RuleItem[] = [
    {
        name: "aiRules.mobile.gazeTracking",
        label: "Gaze Tracking",
        description: "Monitor eye movement via front camera to detect off-screen glancing.",
    },
    {
        name: "aiRules.mobile.audioDetection",
        label: "Audio Anomaly Detection",
        description: "Analyze ambient sound for voices or suspicious audio on mobile.",
    },
    {
        name: "aiRules.mobile.appPinning",
        label: "App Pinning",
        description: "Lock the exam app to the foreground, preventing navigation away.",
    },
    {
        name: "aiRules.mobile.screenshotDisable",
        label: "Screenshot Disable",
        description: "Prevent screenshots and screen recordings during the exam.",
    },
];

function RuleToggleGrid({ rules }: { rules: RuleItem[] }) {
    const { control } = useFormContext<FormValues>();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => (
                <FormField
                    key={rule.name}
                    control={control}
                    name={rule.name}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start justify-between gap-3 rounded-lg border p-3">
                            <div className="space-y-0.5">
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
    return (
        <Tabs defaultValue="web" className="w-full">
            <TabsList className="bg-muted/50 gap-1">
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
    );
}
