import { AlertTriangle } from "lucide-react";
import { cn } from "@sentinel/ui";
import { ExamConfig } from '@sentinel/shared/types';

interface MonitoringInfoProps {
     isMobile: boolean;
     configuration?: ExamConfig;
}

function buildActiveRules(isMobile: boolean, configuration?: ExamConfig) {
     if (!configuration) {
          return ['Camera monitoring', 'Audio monitoring'];
     }

     const sharedRules = [
          configuration.aiRules.gaze_tracking ? 'Gaze tracking' : null,
          configuration.aiRules.face_detection ? 'Face detection' : null,
          configuration.aiRules.audio_anomaly_detection ? 'Audio analysis' : null,
          configuration.aiRules.multiple_faces_detection ? 'Multiple face alerts' : null,
     ];

     const platformRules = isMobile
          ? [
               configuration.mobileSecurity.app_pinning_required ? 'App pinning' : null,
               configuration.mobileSecurity.prevent_backgrounding ? 'Background lock' : null,
               configuration.mobileSecurity.screenshot_block ? 'Screenshot block' : null,
          ]
          : [
               configuration.webSecurity.full_screen_required ? 'Fullscreen required' : null,
               configuration.webSecurity.tab_switching_monitor ? 'Tab switching monitor' : null,
               configuration.webSecurity.clipboard_control ? 'Clipboard control' : null,
          ];

     return [...sharedRules, ...platformRules].filter(Boolean) as string[];
}

export function MonitoringInfo({ isMobile, configuration }: MonitoringInfoProps) {
     const activeRules = buildActiveRules(isMobile, configuration);

     return (
          <div className="p-2.5 sm:p-3 bg-muted/10">
               <div className="flex items-start gap-2 sm:gap-2.5">
                    <div className={cn(
                         "p-1.5 rounded-md flex-shrink-0",
                         isMobile ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                         <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                         <div className="text-xs sm:text-sm font-medium">
                              {isMobile ? "Strict Focus Mode" : "Standard Monitoring"}
                         </div>
                         <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              {isMobile
                                   ? "Exiting the app is prohibited and will be logged."
                                   : "Switching tabs or minimizing will be flagged."}
                         </div>
                         <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                              {activeRules.slice(0, 4).map((rule) => (
                                   <div
                                        key={rule}
                                        className="bg-background/50 border border-border/50 rounded px-1.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] text-muted-foreground text-center truncate"
                                   >
                                        • {rule}
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>
          </div>
     );
}
