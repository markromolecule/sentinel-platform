import { Badge, Switch } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

const AI_RULES: Array<{
    key: keyof ExaminationGlobalSettings['defaultAiRules'];
    label: string;
    description: string;
}> = [
    {
        key: 'gaze_tracking',
        label: 'Gaze Tracking',
        description: 'Monitor off-screen attention drift and focus changes.',
    },
    {
        key: 'face_detection',
        label: 'Face Detection',
        description: 'Require a visible student face during the attempt.',
    },
    {
        key: 'audio_anomaly_detection',
        label: 'Audio Anomaly',
        description: 'Flag unexpected voices or suspicious sounds.',
    },
    {
        key: 'multiple_faces_detection',
        label: 'Multi-Face Detection',
        description: 'Detect other people entering the camera frame.',
    },
];

type MonitoringViewProps = {
    draft: ExaminationGlobalSettings;
    isPending: boolean;
    updateNestedField: <
        TSection extends 'defaultAiRules',
        TKey extends keyof ExaminationGlobalSettings[TSection],
    >(
        section: TSection,
        key: TKey,
        value: ExaminationGlobalSettings[TSection][TKey],
    ) => void;
};

export function MonitoringView({ draft, isPending, updateNestedField }: MonitoringViewProps) {
    return (
        <div className="space-y-12">
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                        <h3 className="text-muted-foreground/80 text-[12px] font-semibold">
                            AI Monitoring Engine
                        </h3>
                        <p className="text-foreground text-[14px] font-semibold">
                            Shared intelligent monitoring rules that apply across all platforms and
                            clients.
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-muted/50 text-muted-foreground bg-background rounded-none text-[12px] font-semibold"
                    >
                        {Object.values(draft.defaultAiRules).filter(Boolean).length} Rules Active
                    </Badge>
                </div>

                <div className="grid grid-cols-1 border-t border-l sm:grid-cols-2">
                    {AI_RULES.map((item) => (
                        <div
                            key={item.key}
                            className="bg-background hover:bg-muted/5 flex items-start justify-between gap-4 border-r border-b p-5 transition-colors"
                        >
                            <div className="space-y-1">
                                <div className="text-foreground text-[14px] font-semibold">
                                    {item.label}
                                </div>
                                <div className="text-muted-foreground text-[12px] leading-relaxed font-medium opacity-70">
                                    {item.description}
                                </div>
                            </div>
                            <Switch
                                checked={Boolean(draft.defaultAiRules[item.key])}
                                onCheckedChange={(c) =>
                                    updateNestedField('defaultAiRules', item.key, c as never)
                                }
                                disabled={isPending}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <div className="border-muted border border-dashed p-10 text-center">
                <div className="text-muted-foreground text-[12px] font-semibold opacity-40">
                    Additional Signals Coming Soon
                </div>
                <p className="text-muted-foreground/60 mt-2 text-[12px] font-medium">
                    We are currently calibrating behavioral drift and keyboard biometric signals.
                </p>
            </div>
        </div>
    );
}
