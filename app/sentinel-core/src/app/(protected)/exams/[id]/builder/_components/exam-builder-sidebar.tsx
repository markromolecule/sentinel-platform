'use client';

import type { ReactNode } from 'react';
import { useExamConfigurationQuery } from '@sentinel/hooks';
import { Badge, Button, Separator, Switch } from '@sentinel/ui';
import { Activity, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    applyExamRuleToggle,
    getExamRuleToggleKey,
    getExamRuleToggleState,
    getSystemConfigurationRows,
    TOGGLE_OPTIONS,
} from '@/app/(protected)/exams/[id]/builder/_components/_constants';
import type { ExamBuilderSidebarProps } from '@/app/(protected)/exams/[id]/builder/_components/_types';

/**
 * ExamBuilderSidebar renders the controls that shape the exam experience, including rules and
 * a concise configuration summary.
 *
 * @param props - ExamBuilderSidebarProps containing the builder state and toggle handlers.
 */
export function ExamBuilderSidebar({
    settings,
    configuration,
    handleToggleExamSetting,
    handleToggleLobbyAdmissionMode,
    handleToggleReleaseScoreMode,
}: ExamBuilderSidebarProps) {
    const params = useParams();
    const id = params?.id as string;
    const { data: configurationState, isLoading: isConfigurationLoading } =
        useExamConfigurationQuery(id);
    const systemConfigurationRows = getSystemConfigurationRows(configurationState?.configuration);
    const enabledRuleCount = TOGGLE_OPTIONS.filter((option) =>
        getExamRuleToggleState({
            option,
            settings,
            configuration,
        }),
    ).length;

    return (
        <div className="space-y-4">
            <section className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <SectionHeading title="Exam Rules" />
                    <Badge variant="secondary" className="shrink-0 gap-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        {enabledRuleCount}/{TOGGLE_OPTIONS.length} enabled
                    </Badge>
                </div>

                <div className="grid gap-2">
                    {TOGGLE_OPTIONS.map((option) => (
                        <SidebarToggleRow
                            key={getExamRuleToggleKey(option)}
                            label={option.label}
                            enabled={getExamRuleToggleState({
                                option,
                                settings,
                                configuration,
                            })}
                            onCheckedChange={(checked) =>
                                applyExamRuleToggle({
                                    option,
                                    checked,
                                    onToggleSetting: handleToggleExamSetting,
                                    onToggleLobbyAdmissionMode: handleToggleLobbyAdmissionMode,
                                    onToggleReleaseScoreMode: handleToggleReleaseScoreMode,
                                })
                            }
                        />
                    ))}
                </div>
            </section>

            <Separator />

            <section className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <SectionHeading title="Configuration" />
                    <Badge variant={isConfigurationLoading ? 'outline' : 'secondary'}>
                        {isConfigurationLoading ? 'Syncing' : 'Ready'}
                    </Badge>
                </div>

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
        </div>
    );
}

function SectionHeading({ title }: { title: string }) {
    return <h3 className="text-sm font-semibold tracking-tight text-[#323d8f]">{title}</h3>;
}

function SidebarInfoRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-3 py-1.5">
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
        <div className="border-border/60 bg-background flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
            <span className="min-w-0">
                <span className="text-foreground block text-sm font-medium">{label}</span>
            </span>
            <Switch
                aria-label={label}
                checked={enabled}
                onCheckedChange={onCheckedChange}
                className="data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted shrink-0"
            />
        </div>
    );
}
