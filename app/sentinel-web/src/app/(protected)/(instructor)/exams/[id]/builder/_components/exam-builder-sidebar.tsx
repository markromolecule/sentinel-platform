'use client';

import { useExamConfigurationQuery } from '@sentinel/hooks';
import { Button, Separator, Switch } from '@sentinel/ui';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    getSystemConfigurationRows,
    TOGGLE_OPTIONS,
} from '@/app/(protected)/(instructor)/exams/[id]/builder/_components/_constants';
import type { ExamBuilderSidebarProps } from '@/app/(protected)/(instructor)/exams/[id]/builder/_components/_types';

export function ExamBuilderSidebar({ settings, handleToggleExamSetting }: ExamBuilderSidebarProps) {
    const params = useParams();
    const id = params?.id as string;
    const { data: configurationState, isLoading: isConfigurationLoading } =
        useExamConfigurationQuery(id);
    const systemConfigurationRows = getSystemConfigurationRows(configurationState?.configuration);

    return (
        <aside className="border-border/60 xl:border-border/60 flex flex-col gap-4 border-b pb-4 xl:sticky xl:top-5 xl:min-h-[calc(100vh-2.5rem)] xl:self-start xl:border-r xl:border-b-0 xl:pr-5 xl:pb-0">
            <section className="space-y-3">
                <SectionHeading
                    title="Exam Rules"
                    description="Student-facing behavior for this exam. Save the draft or publish to persist changes."
                />

                <div className="grid gap-2">
                    {TOGGLE_OPTIONS.map((option) => (
                        <SidebarToggleRow
                            key={option.key}
                            label={option.label}
                            enabled={settings[option.key]}
                            onCheckedChange={(checked) =>
                                handleToggleExamSetting(option.key, checked)
                            }
                        />
                    ))}
                </div>
            </section>

            <Separator />

            <section className="space-y-3">
                <SectionHeading
                    title="System Configuration"
                    description="Live proctoring policy saved for this exam."
                />

                {isConfigurationLoading ? (
                    <p aria-live="polite" className="text-muted-foreground text-sm">
                        Loading saved configuration...
                    </p>
                ) : systemConfigurationRows.length > 0 ? (
                    <div className="grid gap-3 text-sm">
                        {systemConfigurationRows.map((row) => {
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
                ) : (
                    <p className="text-muted-foreground text-sm">
                        Configuration details are unavailable right now.
                    </p>
                )}

                <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href={`/exams/config?id=${id}`}>
                        <Settings className="h-4 w-4" />
                        Open Full Configuration
                    </Link>
                </Button>
            </section>
        </aside>
    );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-tight text-[#323d8f]">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
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
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                    {label}
                </p>
                <p className="text-foreground text-sm">{value}</p>
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
        <div className="border-border/60 flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-foreground text-sm">{label}</span>
            <Switch
                checked={enabled}
                onCheckedChange={onCheckedChange}
                className="data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted"
            />
        </div>
    );
}
