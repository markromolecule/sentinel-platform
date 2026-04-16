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
            <h3 className="text-foreground flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="text-destructive h-5 w-5" />
                Proctoring Report
            </h3>

            <div className="bg-card border-destructive/20 overflow-hidden rounded-xl border">
                <div className="flex items-start gap-4 p-4">
                    <div className="bg-destructive/10 shrink-0 rounded-lg p-2.5">
                        <Icon className="text-destructive h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-destructive mb-1 text-base font-semibold">
                            {details.title}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {details.description}
                        </p>
                    </div>
                </div>

                {/* Optional: Add a timeline or detailed log here if available in future */}
                <div className="flex items-center justify-between border-t border-red-500/10 bg-red-500/5 px-4 py-2 text-xs text-red-400/80">
                    <span>Severity: High</span>
                    <span>Time: Throughout Exam</span>
                </div>
            </div>
        </div>
    );
}
