"use client";

import { useExamConfigForm } from "@/app/(protected)/admin/exams/configuration/_hooks/use-exam-config-form";
import { DeviceHardwareSection } from "@/app/(protected)/admin/exams/configuration/_components/device-hardware-section";
import { AiRulesSection } from "@/app/(protected)/admin/exams/configuration/_components/ai-rules-section";
import { SecuritySettingsSection } from "@/app/(protected)/admin/exams/configuration/_components/security-settings-section";
import { Form } from "@sentinel/ui";
import { Card, CardContent } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";
import { ExamConfig } from '@sentinel/shared/types';

interface ExamConfigFormProps {
    defaultValues: ExamConfig;
}

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-0.5">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

export function ExamConfigForm({ defaultValues }: ExamConfigFormProps) {
    const { form, onSubmit } = useExamConfigForm({ defaultValues });

    return (
        <Form {...form}>
            <form id="admin-config-form" onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
                            {/* Left column — compact settings */}
                            <div className="space-y-5">
                                <section className="space-y-3">
                                    <SectionHeader
                                        title="Hardware Requirements"
                                        description="Devices required during proctored sessions."
                                    />
                                    <DeviceHardwareSection />
                                </section>

                                <Separator />

                                <section className="space-y-3">
                                    <SectionHeader
                                        title="Security & Stability"
                                        description="Reconnection and auto-submit limits."
                                    />
                                    <SecuritySettingsSection />
                                </section>
                            </div>

                            {/* Right column — proctoring tabs */}
                            <div className="lg:border-l lg:pl-6">
                                <section className="space-y-3">
                                    <SectionHeader
                                        title="Proctoring"
                                        description="Enable or disable proctoring features."
                                    />
                                    <AiRulesSection />
                                </section>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
