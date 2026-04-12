"use client";

import type { ReactNode } from "react";
import { Camera, Mic, ShieldCheck, Smartphone, MonitorSmartphone } from "lucide-react";
import { useExamConfigForm } from "@/features/exams/config/_hooks/use-exam-config-form";
import { DeviceHardwareSection } from "@/features/exams/config/_components/device-hardware-section";
import { AiRulesSection } from "@/features/exams/config/_components/ai-rules-section";
import { SecuritySettingsSection } from "@/features/exams/config/_components/security-settings-section";
import { Form } from "@sentinel/ui";
import { Card, CardContent } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";
import { ExamConfig } from '@sentinel/shared/types';

interface ExamConfigFormProps {
    defaultValues: ExamConfig;
    onSubmit: (values: ExamConfig) => Promise<void> | void;
    formId?: string;
}

function countEnabledRules(rules: Record<string, boolean>) {
    return Object.values(rules).filter(Boolean).length;
}

function SectionHeader({
    title,
    description,
    badge,
}: {
    title: string;
    description: string;
    badge?: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{title}</h3>
                {badge ? (
                    <Badge variant="secondary" className="rounded-md px-2 py-0 text-[10px] font-medium">
                        {badge}
                    </Badge>
                ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function SummaryTile({
    icon,
    label,
    value,
    hint,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold leading-tight">{value}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
            </div>
        </div>
    );
}

export function ExamConfigForm({
    defaultValues,
    onSubmit,
    formId = 'proctor-config-form',
}: ExamConfigFormProps) {
    const { form, onSubmit: handleSubmit } = useExamConfigForm({ defaultValues, onSubmit });
    const values = form.watch();

    const accessSummary = [
        values.cameraRequired ? 'camera' : null,
        values.micRequired ? 'microphone' : null,
        values.strictMode ? 'strict mode' : null,
        values.screenLock ? 'screen lock' : null,
    ].filter(Boolean);

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">Policy Overview</h3>
                                    <Badge variant="outline" className="rounded-md text-[10px] uppercase tracking-wide">
                                        Live Preview
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Review the active access requirements and the protection coverage for each platform before saving.
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <SummaryTile
                                    icon={<div className="flex gap-1"><Camera className="h-4 w-4" /><Mic className="h-4 w-4" /></div>}
                                    label="Access"
                                    value={accessSummary.length > 0 ? accessSummary.join(', ') : 'Flexible access'}
                                    hint="What the student must grant before entering the exam."
                                />
                                <SummaryTile
                                    icon={<ShieldCheck className="h-4 w-4" />}
                                    label="Recovery"
                                    value={`${values.maxReconnectAttempts} reconnects / ${values.autoSubmitTimeoutMinutes} min timeout`}
                                    hint="How much interruption tolerance the session allows."
                                />
                                <SummaryTile
                                    icon={<MonitorSmartphone className="h-4 w-4" />}
                                    label="Web Protection"
                                    value={`${countEnabledRules(values.webSecurity)} safeguards enabled`}
                                    hint="Browser-specific monitoring and lock-down coverage."
                                />
                                <SummaryTile
                                    icon={<Smartphone className="h-4 w-4" />}
                                    label="Mobile Protection"
                                    value={`${countEnabledRules(values.mobileSecurity)} safeguards enabled`}
                                    hint="Foreground, screenshot, and device integrity controls."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.55fr]">
                                <div className="space-y-5">
                                    <section className="space-y-3">
                                        <SectionHeader
                                            title="Access & Enforcement"
                                            badge={`${accessSummary.length || 0} active`}
                                            description="Choose the permissions and lock-in controls students must satisfy before the session begins."
                                        />
                                        <DeviceHardwareSection />
                                    </section>

                                    <Separator />

                                    <section className="space-y-3">
                                        <SectionHeader
                                            title="Session Recovery"
                                            badge="Stability"
                                            description="Define how many interruptions are tolerated and when the session should auto-submit."
                                        />
                                        <SecuritySettingsSection />
                                    </section>
                                </div>

                                <div className="space-y-3 lg:border-l lg:pl-6">
                                    <SectionHeader
                                        title="Detection & Protection"
                                        badge={`${countEnabledRules(values.aiRules) + countEnabledRules(values.webSecurity) + countEnabledRules(values.mobileSecurity)} active rules`}
                                        description="Tune the shared monitoring signals and the platform-specific safeguards used on web and mobile."
                                    />
                                    <AiRulesSection />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}
