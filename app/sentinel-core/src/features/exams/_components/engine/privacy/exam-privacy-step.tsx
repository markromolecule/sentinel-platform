'use client';

import { CheckCircle2, Eye, Monitor, Smartphone } from 'lucide-react';

import type { ExamPrivacyStepProps } from '../types';
import { isPreviewMode } from '../utils';

export function ExamPrivacyStep({
    cameraRequired,
    micRequired,
    fullscreenRequired,
    monitoringEnabled,
    platform,
    mode = 'runtime',
}: ExamPrivacyStepProps) {
    const disclosures = [
        cameraRequired
            ? 'Camera access is part of the readiness check.'
            : 'Camera capture is not required.',
        micRequired
            ? 'Microphone access can be requested for the exam.'
            : 'Microphone capture is not required.',
        fullscreenRequired
            ? 'Fullscreen entry is enforced before the live attempt starts.'
            : 'Fullscreen entry is not enforced for this exam.',
        monitoringEnabled
            ? 'Monitoring indicators are shown for visual review in this preview.'
            : 'Monitoring indicators are intentionally muted in this preview.',
    ];

    return (
        <div className="flex h-full flex-col gap-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <article className="border-border/60 bg-background rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Eye className="text-primary h-4 w-4" />
                        <h2 className="text-lg font-semibold">Privacy acknowledgement</h2>
                    </div>
                    <div className="text-muted-foreground space-y-4 text-sm leading-6">
                        <p>
                            Students should understand why device access is requested before any
                            camera or microphone stream is used. This step is the place to explain
                            monitoring scope in plain language.
                        </p>
                        <p>
                            The current preview mirrors the runtime sequence while keeping the
                            acknowledgement copy lightweight and easy to validate.
                        </p>
                    </div>
                </article>

                <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        {platform === 'mobile' ? (
                            <Smartphone className="text-primary h-4 w-4" />
                        ) : (
                            <Monitor className="text-primary h-4 w-4" />
                        )}
                        <h2 className="text-lg font-semibold">Current disclosure set</h2>
                    </div>
                    <ul className="text-muted-foreground space-y-3 text-sm leading-6">
                        {disclosures.map((item) => (
                            <li key={item} className="flex gap-3">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </article>
            </div>

            {isPreviewMode(mode) ? (
                <div className="border-primary/15 bg-primary/5 rounded-3xl border px-5 py-4 text-sm leading-6 sm:px-6">
                    Adjust the preview controls to inspect how the acknowledgement changes when
                    hardware rules or monitoring indicators are toggled locally.
                </div>
            ) : null}
        </div>
    );
}
