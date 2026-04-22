'use client';

import { Badge, Switch } from '@sentinel/ui';
import type { ExaminationGlobalSettings } from '@sentinel/shared/types';

const AI_RULES: Array<{ key: keyof ExaminationGlobalSettings['defaultAiRules']; label: string; description: string }> = [
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
    updateNestedField: <TSection extends 'defaultAiRules', TKey extends keyof ExaminationGlobalSettings[TSection]>(
        section: TSection,
        key: TKey,
        value: ExaminationGlobalSettings[TSection][TKey]
    ) => void;
};

export function MonitoringView({ draft, isPending, updateNestedField }: MonitoringViewProps) {
    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                        AI Monitoring Engine
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Shared intelligent monitoring rules that apply across all platforms and clients.
                    </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-background">
                    {Object.values(draft.defaultAiRules).filter(Boolean).length} Rules Active
                </Badge>
            </div>

            <div className="grid gap-x-12 gap-y-2 lg:grid-cols-2">
                {AI_RULES.map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-4 rounded-xl border bg-card/30 p-5 transition-colors hover:bg-card/50">
                        <div className="space-y-1">
                            <div className="text-[13px] font-bold text-foreground/90 uppercase tracking-tight">{item.label}</div>
                            <div className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-70 italic">{item.description}</div>
                        </div>
                        <Switch 
                            checked={Boolean(draft.defaultAiRules[item.key])} 
                            onCheckedChange={(c) => updateNestedField('defaultAiRules', item.key, c as never)} 
                            disabled={isPending} 
                        />
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border-2 border-dashed p-10 text-center">
                <div className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">
                    Additional Signals Coming Soon
                </div>
                <p className="mt-2 text-[10px] font-medium text-muted-foreground/60 italic">
                    We are currently calibrating behavioral drift and keyboard biometric signals.
                </p>
            </div>
        </div>
    );
}
