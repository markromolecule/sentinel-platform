import {
    AlertTriangle,
    AppWindow,
    Camera,
    Eye,
    Maximize2,
    Mic,
    Smartphone,
    Video,
} from 'lucide-react';
import { CheatingReportProps } from '@sentinel/shared/constants';

export function CheatingReport({ cheated, cheatingType }: CheatingReportProps) {
    if (!cheated) return null;

    const getCheatingDetails = (type?: string) => {
        switch (type) {
            case 'gaze':
                return {
                    icon: Eye,
                    title: 'Gaze Detected',
                    description: 'Frequent looking away from the screen was detected.',
                };
            case 'audio':
                return {
                    icon: Mic,
                    title: 'Audio Detected',
                    description: 'Suspicious audio levels or voices were detected.',
                };
            case 'tab_switch':
                return {
                    icon: AppWindow,
                    title: 'Tab Switch Detected',
                    description: 'The exam window lost focus multiple times.',
                };
            case 'screenshot':
                return {
                    icon: Camera,
                    title: 'Screenshot Detected',
                    description: 'An attempt to capture the screen was recorded.',
                };
            case 'screen_record':
                return {
                    icon: Video,
                    title: 'Screen Recording Detected',
                    description: 'Screen recording software was active during the session.',
                };
            case 'split_screen':
                return {
                    icon: Maximize2,
                    title: 'Split Screen Detected',
                    description: 'Split screen mode was activated on the device.',
                };
            case 'device_leave':
                return {
                    icon: Smartphone,
                    title: 'App Background Detected',
                    description: 'The application was moved to the background.',
                };
            default:
                return {
                    icon: AlertTriangle,
                    title: 'Anomaly Detected',
                    description: 'Unusual activity was flagged by the proctoring system.',
                };
        }
    };

    const details = getCheatingDetails(cheatingType);
    const Icon = details.icon;

    return (
        <div className="space-y-2">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="text-destructive h-4 w-4" />
                Proctoring Report
            </h3>

            <div className="border-border/60 overflow-hidden border">
                <div className="flex items-start gap-4 p-4 sm:p-5">
                    <div className="bg-destructive/10 shrink-0 p-2.5">
                        <Icon className="text-destructive h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-foreground mb-1 text-base font-semibold">
                            {details.title}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {details.description}
                        </p>
                    </div>
                </div>

                <div className="bg-muted/40 border-border/60 flex flex-col gap-1 border-t px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-muted-foreground">Severity: High</span>
                    <span className="text-muted-foreground">Time: Throughout Exam</span>
                </div>
            </div>
        </div>
    );
}
