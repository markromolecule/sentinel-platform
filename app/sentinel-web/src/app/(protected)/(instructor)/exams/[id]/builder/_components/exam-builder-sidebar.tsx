"use client";

import Link from "next/link";
import { Button, Separator, Switch } from "@sentinel/ui";
import {
    Clock3,
    Cpu,
    LaptopMinimal,
    Mic,
    Settings,
    ShieldCheck,
    Video,
} from "lucide-react";
import { MOCK_EXAM_CONFIG } from "@sentinel/shared/constants";
import type { ExamSettings } from "@sentinel/shared/types";
import type { UseExamBuilderResult } from "../hooks/use-exam-builder/_types";

type ExamBuilderSidebarProps = Pick<
    UseExamBuilderResult,
    "settings" | "handleToggleExamSetting"
>;

type ToggleOption = {
    key: keyof ExamSettings;
    label: string;
};

const TOGGLE_OPTIONS: ToggleOption[] = [
    { key: "shuffleQuestions", label: "Shuffle Questions" },
    { key: "showCorrectAnswers", label: "Show Correct Answers" },
    { key: "allowReview", label: "Allow Review" },
    { key: "randomizeChoices", label: "Randomize Choices" },
];

const HARDWARE_REQUIREMENTS = [
    MOCK_EXAM_CONFIG.cameraRequired ? "Camera required" : null,
    MOCK_EXAM_CONFIG.micRequired ? "Mic required" : null,
].filter(Boolean).join(" • ") || "No hardware requirements";

const SYSTEM_CONFIGURATION_ROWS = [
    {
        label: "Policy",
        value: MOCK_EXAM_CONFIG.name,
        icon: Cpu,
    },
    {
        label: "Devices",
        value: MOCK_EXAM_CONFIG.allowedDevices.join(", "),
        icon: LaptopMinimal,
    },
    {
        label: "Hardware",
        value: HARDWARE_REQUIREMENTS,
        icon: Video,
    },
    {
        label: "Reconnect Limit",
        value: `${MOCK_EXAM_CONFIG.maxReconnectAttempts} attempts`,
        icon: ShieldCheck,
    },
    {
        label: "Auto Submit",
        value: `${MOCK_EXAM_CONFIG.autoSubmitTimeout} min timeout`,
        icon: Clock3,
    },
    {
        label: "Web Safeguards",
        value: `${countEnabledRules(MOCK_EXAM_CONFIG.aiRules.web)} enabled`,
        icon: Mic,
    },
    {
        label: "Mobile Safeguards",
        value: `${countEnabledRules(MOCK_EXAM_CONFIG.aiRules.mobile)} enabled`,
        icon: Mic,
    },
];

export function ExamBuilderSidebar({
    settings,
    handleToggleExamSetting,
}: ExamBuilderSidebarProps) {
    return (
        <aside className="flex flex-col gap-4 border-b border-border/60 pb-4 xl:sticky xl:top-5 xl:min-h-[calc(100vh-2.5rem)] xl:self-start xl:border-b-0 xl:border-r xl:border-border/60 xl:pb-0 xl:pr-5">
            <section className="space-y-3">
                <SectionHeading
                    title="Exam Rules"
                    description="Visible student-side behavior for this exam."
                />

                <div className="grid gap-2">
                    {TOGGLE_OPTIONS.map((option) => (
                        <SidebarToggleRow
                            key={option.key}
                            label={option.label}
                            enabled={settings[option.key]}
                            onCheckedChange={(checked) => handleToggleExamSetting(option.key, checked)}
                        />
                    ))}
                </div>
            </section>

            <Separator />

            <section className="space-y-3">
                <SectionHeading
                    title="System Configuration"
                    description="Proctoring and system-side policy applied to this exam."
                />

                <div className="grid gap-3 text-sm">
                    {SYSTEM_CONFIGURATION_ROWS.map((row) => {
                        const Icon = row.icon;

                        return (
                            <SidebarInfoRow
                                key={row.label}
                                label={row.label}
                                value={row.value}
                                icon={<Icon className="h-4 w-4" />}
                            />
                        );
                    })}
                </div>

                <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href="/exams/config">
                        <Settings className="h-4 w-4" />
                        Open Full Configuration
                    </Link>
                </Button>
            </section>
        </aside>
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-tight text-[#323d8f]">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function SidebarInfoRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-3">
            <div className="pt-0.5 text-[#323d8f]">{icon}</div>
            <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-sm text-foreground">{value}</p>
            </div>
        </div>
    );
}

function SidebarToggleRow({
    label,
    enabled,
    onCheckedChange,
}: {
    label: string;
    enabled: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <span className="text-sm text-foreground">{label}</span>
            <Switch
                checked={enabled}
                onCheckedChange={onCheckedChange}
                className="data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted"
            />
        </div>
    );
}

function countEnabledRules(rules: Record<string, boolean>) {
    return Object.values(rules).filter(Boolean).length;
}
