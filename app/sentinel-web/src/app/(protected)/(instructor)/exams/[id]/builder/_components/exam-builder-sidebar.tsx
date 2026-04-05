"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Separator, Switch } from "@sentinel/ui";
import { Settings } from "lucide-react";
import {
    TOGGLE_OPTIONS,
    SYSTEM_CONFIGURATION_ROWS
} from "@/app/(protected)/(instructor)/exams/[id]/builder/_components/_constants";
import type { ExamBuilderSidebarProps } from "@/app/(protected)/(instructor)/exams/[id]/builder/_components/_types";

export function ExamBuilderSidebar({
    settings,
    handleToggleExamSetting,
}: ExamBuilderSidebarProps) {
    const params = useParams();
    const id = params?.id as string;

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
                    <Link href={`/exams/config?id=${id}`}>
                        <Settings className="h-4 w-4" />
                        Exam Configuration
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