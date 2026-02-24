import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormContext } from "react-hook-form";
import { FormValues } from '@sentinel/shared/types';
import { RuleItem } from '@/app/(protected)/admin/exams/configuration/_types';
import { WEB_RULES, MOBILE_RULES } from '@/app/(protected)/admin/exams/configuration/_constants';

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
                        <FormItem className="flex flex-row items-start justify-between gap-3 rounded-md border p-3">
                            <div className="space-y-0.5">
                                <FormLabel className="font-normal">
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
